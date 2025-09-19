package com.inventory.management.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Size(max = 20, message = "SKU must not exceed 20 characters")
    private String sku;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Price in is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price in must be greater than 0")
    private BigDecimal priceIn;

    @NotNull(message = "Price out is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price out must be greater than 0")
    private BigDecimal priceOut;

    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    @Min(value = 0, message = "Minimum stock cannot be negative")
    private Integer minimumStock;

    private Long supplierId;
    private String supplierName;

    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
