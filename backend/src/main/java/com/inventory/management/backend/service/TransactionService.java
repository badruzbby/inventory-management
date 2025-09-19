package com.inventory.management.backend.service;

import com.inventory.management.backend.dto.TransactionDto;
import com.inventory.management.backend.dto.TransactionSummaryDto;
import com.inventory.management.backend.entity.Product;
import com.inventory.management.backend.entity.Supplier;
import com.inventory.management.backend.entity.Transaction;
import com.inventory.management.backend.entity.User;
import com.inventory.management.backend.repository.ProductRepository;
import com.inventory.management.backend.repository.SupplierRepository;
import com.inventory.management.backend.repository.TransactionRepository;
import com.inventory.management.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final ModelMapper modelMapper;

    public List<TransactionDto> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<TransactionDto> getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(this::convertToDto);
    }

    public List<TransactionDto> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductIdOrderByTransactionDateDesc(productId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TransactionDto> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TransactionDto> getTransactionsByType(Transaction.TransactionType type) {
        return transactionRepository.findByTypeOrderByTransactionDateDesc(type).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TransactionDto> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        return transactionRepository.findByDateRange(startDateTime, endDateTime).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TransactionDto createTransaction(TransactionDto transactionDto) {
        Product product = productRepository.findById(transactionDto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepository.findById(transactionDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = convertToEntity(transactionDto);
        transaction.setProduct(product);
        transaction.setUser(user);

        if (transactionDto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(transactionDto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            transaction.setSupplier(supplier);
        }

        // Set unit price if not provided
        if (transaction.getUnitPrice() == null) {
            if (transaction.getType() == Transaction.TransactionType.IN) {
                transaction.setUnitPrice(product.getPriceIn());
            } else {
                transaction.setUnitPrice(product.getPriceOut());
            }
        }

        // Validate stock for OUT transactions
        if (transaction.getType() == Transaction.TransactionType.OUT) {
            if (product.getStock() < transaction.getQuantity()) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
            }
        }

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Update product stock
        updateProductStock(product, transaction);

        return convertToDto(savedTransaction);
    }

    public TransactionDto updateTransaction(Long id, TransactionDto transactionDto) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Reverse the previous stock change
        Product product = existingTransaction.getProduct();
        reverseStockChange(product, existingTransaction);

        // Update transaction details
        existingTransaction.setQuantity(transactionDto.getQuantity());
        existingTransaction.setUnitPrice(transactionDto.getUnitPrice());
        existingTransaction.setNotes(transactionDto.getNotes());
        existingTransaction.setReferenceNumber(transactionDto.getReferenceNumber());

        if (transactionDto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(transactionDto.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            existingTransaction.setSupplier(supplier);
        }

        // Validate stock for OUT transactions
        if (existingTransaction.getType() == Transaction.TransactionType.OUT) {
            if (product.getStock() < existingTransaction.getQuantity()) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
            }
        }

        Transaction updatedTransaction = transactionRepository.save(existingTransaction);

        // Apply new stock change
        updateProductStock(product, updatedTransaction);

        return convertToDto(updatedTransaction);
    }

    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Reverse stock change
        reverseStockChange(transaction.getProduct(), transaction);

        transactionRepository.delete(transaction);
    }

    public List<TransactionSummaryDto> getTransactionSummary(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Object[]> results = transactionRepository.getTransactionSummaryByDateRange(startDateTime, endDateTime);
        
        return results.stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    private void updateProductStock(Product product, Transaction transaction) {
        int currentStock = product.getStock();
        
        if (transaction.getType() == Transaction.TransactionType.IN) {
            product.setStock(currentStock + transaction.getQuantity());
        } else {
            product.setStock(currentStock - transaction.getQuantity());
        }
        
        productRepository.save(product);
    }

    private void reverseStockChange(Product product, Transaction transaction) {
        int currentStock = product.getStock();
        
        if (transaction.getType() == Transaction.TransactionType.IN) {
            product.setStock(currentStock - transaction.getQuantity());
        } else {
            product.setStock(currentStock + transaction.getQuantity());
        }
        
        productRepository.save(product);
    }

    private TransactionDto convertToDto(Transaction transaction) {
        TransactionDto dto = modelMapper.map(transaction, TransactionDto.class);
        dto.setProductId(transaction.getProduct().getId());
        dto.setProductName(transaction.getProduct().getName());
        dto.setUserId(transaction.getUser().getId());
        dto.setUsername(transaction.getUser().getUsername());
        
        if (transaction.getSupplier() != null) {
            dto.setSupplierId(transaction.getSupplier().getId());
            dto.setSupplierName(transaction.getSupplier().getName());
        }
        
        return dto;
    }

    private Transaction convertToEntity(TransactionDto transactionDto) {
        Transaction transaction = modelMapper.map(transactionDto, Transaction.class);
        transaction.setProduct(null); // Will be set separately
        transaction.setUser(null); // Will be set separately
        transaction.setSupplier(null); // Will be set separately
        return transaction;
    }

    private TransactionSummaryDto convertToSummaryDto(Object[] result) {
        TransactionSummaryDto dto = new TransactionSummaryDto();
        dto.setDate(((java.sql.Date) result[0]).toLocalDate());
        dto.setPeriod("DAILY");
        dto.setTotalTransactions(((Number) result[1]).longValue());
        dto.setInTransactions(((Number) result[2]).longValue());
        dto.setOutTransactions(((Number) result[3]).longValue());
        dto.setTotalInValue((BigDecimal) result[4]);
        dto.setTotalOutValue((BigDecimal) result[5]);
        dto.setNetValue(dto.getTotalInValue().subtract(dto.getTotalOutValue()));
        return dto;
    }
}
