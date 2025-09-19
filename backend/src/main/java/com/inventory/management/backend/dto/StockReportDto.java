package com.inventory.management.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockReportDto {
    private Long productId;
    private String productName;
    private String category;
    private String sku;
    private Integer currentStock;
    private Integer minimumStock;
    private BigDecimal priceIn;
    private BigDecimal priceOut;
    private String supplierName;
    private Boolean lowStock;
    private BigDecimal stockValue;
}
