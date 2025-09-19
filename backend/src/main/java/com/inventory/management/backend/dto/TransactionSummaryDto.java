package com.inventory.management.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSummaryDto {
    private LocalDate date;
    private String period; // DAILY, WEEKLY, MONTHLY
    private Long totalTransactions;
    private Long inTransactions;
    private Long outTransactions;
    private BigDecimal totalInValue;
    private BigDecimal totalOutValue;
    private BigDecimal netValue;
}
