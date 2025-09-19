package com.inventory.management.backend.service;

import com.inventory.management.backend.dto.SupplierDto;
import com.inventory.management.backend.entity.Supplier;
import com.inventory.management.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierService {
    private final SupplierRepository supplierRepository;
    private final ModelMapper modelMapper;

    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<SupplierDto> getActiveSuppliers() {
        return supplierRepository.findByActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<SupplierDto> getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .map(this::convertToDto);
    }

    public List<SupplierDto> searchSuppliers(String keyword) {
        return supplierRepository.findByKeyword(keyword).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public SupplierDto createSupplier(SupplierDto supplierDto) {
        if (supplierRepository.existsByNameIgnoreCase(supplierDto.getName())) {
            throw new RuntimeException("Supplier with this name already exists");
        }

        Supplier supplier = convertToEntity(supplierDto);
        supplier.setActive(true);
        
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDto(savedSupplier);
    }

    public SupplierDto updateSupplier(Long id, SupplierDto supplierDto) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Check name uniqueness if changed
        if (!existingSupplier.getName().equalsIgnoreCase(supplierDto.getName()) && 
            supplierRepository.existsByNameIgnoreCase(supplierDto.getName())) {
            throw new RuntimeException("Supplier with this name already exists");
        }

        existingSupplier.setName(supplierDto.getName());
        existingSupplier.setAddress(supplierDto.getAddress());
        existingSupplier.setPhone(supplierDto.getPhone());
        existingSupplier.setEmail(supplierDto.getEmail());
        existingSupplier.setContactPerson(supplierDto.getContactPerson());
        existingSupplier.setActive(supplierDto.getActive());

        Supplier updatedSupplier = supplierRepository.save(existingSupplier);
        return convertToDto(updatedSupplier);
    }

    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    private SupplierDto convertToDto(Supplier supplier) {
        return modelMapper.map(supplier, SupplierDto.class);
    }

    private Supplier convertToEntity(SupplierDto supplierDto) {
        return modelMapper.map(supplierDto, Supplier.class);
    }
}
