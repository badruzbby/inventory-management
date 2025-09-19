package com.inventory.management.backend.service;

import com.inventory.management.backend.dto.ProductDto;
import com.inventory.management.backend.dto.StockReportDto;
import com.inventory.management.backend.entity.Product;
import com.inventory.management.backend.entity.Supplier;
import com.inventory.management.backend.repository.ProductRepository;
import com.inventory.management.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final ModelMapper modelMapper;

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getActiveProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<ProductDto> getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::convertToDto);
    }

    public List<ProductDto> getProductsByCategory(String category) {
        return productRepository.findByActiveTrueAndCategory(category).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getProductsBySupplier(Long supplierId) {
        return productRepository.findByActiveTrueAndSupplierId(supplierId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> searchProducts(String keyword) {
        return productRepository.findByKeyword(keyword).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }

    public ProductDto createProduct(ProductDto productDto) {
        if (productDto.getSku() != null && productRepository.existsBySkuIgnoreCase(productDto.getSku())) {
            throw new RuntimeException("Product with this SKU already exists");
        }

        Product product = convertToEntity(productDto);
        
        if (productDto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(productDto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            product.setSupplier(supplier);
        }
        
        product.setActive(true);
        if (product.getStock() == null) {
            product.setStock(0);
        }
        if (product.getMinimumStock() == null) {
            product.setMinimumStock(0);
        }
        
        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check SKU uniqueness if changed
        if (productDto.getSku() != null && 
            !productDto.getSku().equalsIgnoreCase(existingProduct.getSku()) && 
            productRepository.existsBySkuIgnoreCase(productDto.getSku())) {
            throw new RuntimeException("Product with this SKU already exists");
        }

        existingProduct.setName(productDto.getName());
        existingProduct.setCategory(productDto.getCategory());
        existingProduct.setSku(productDto.getSku());
        existingProduct.setDescription(productDto.getDescription());
        existingProduct.setPriceIn(productDto.getPriceIn());
        existingProduct.setPriceOut(productDto.getPriceOut());
        existingProduct.setMinimumStock(productDto.getMinimumStock());
        existingProduct.setActive(productDto.getActive());

        if (productDto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(productDto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            existingProduct.setSupplier(supplier);
        } else {
            existingProduct.setSupplier(null);
        }

        Product updatedProduct = productRepository.save(existingProduct);
        return convertToDto(updatedProduct);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    public void updateStock(Long productId, Integer newStock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStock(newStock);
        productRepository.save(product);
    }

    public List<StockReportDto> getStockReport() {
        return productRepository.findByActiveTrue().stream()
                .map(this::convertToStockReportDto)
                .collect(Collectors.toList());
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = modelMapper.map(product, ProductDto.class);
        if (product.getSupplier() != null) {
            dto.setSupplierId(product.getSupplier().getId());
            dto.setSupplierName(product.getSupplier().getName());
        }
        return dto;
    }

    private Product convertToEntity(ProductDto productDto) {
        Product product = modelMapper.map(productDto, Product.class);
        product.setSupplier(null); // Will be set separately
        return product;
    }

    private StockReportDto convertToStockReportDto(Product product) {
        StockReportDto dto = new StockReportDto();
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setCategory(product.getCategory());
        dto.setSku(product.getSku());
        dto.setCurrentStock(product.getStock());
        dto.setMinimumStock(product.getMinimumStock());
        dto.setPriceIn(product.getPriceIn());
        dto.setPriceOut(product.getPriceOut());
        dto.setSupplierName(product.getSupplier() != null ? product.getSupplier().getName() : null);
        dto.setLowStock(product.getStock() <= product.getMinimumStock());
        dto.setStockValue(product.getPriceIn().multiply(BigDecimal.valueOf(product.getStock())));
        return dto;
    }
}
