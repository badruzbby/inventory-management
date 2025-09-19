package com.inventory.management.backend.controller;

import com.inventory.management.backend.dto.StockReportDto;
import com.inventory.management.backend.dto.TransactionSummaryDto;
import com.inventory.management.backend.service.ProductService;
import com.inventory.management.backend.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Reports", description = "Report generation APIs")
public class ReportController {
    private final ProductService productService;
    private final TransactionService transactionService;

    @GetMapping("/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get stock report", description = "Generate current stock report for all products")
    public ResponseEntity<List<StockReportDto>> getStockReport() {
        List<StockReportDto> report = productService.getStockReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get transaction summary", description = "Generate transaction summary report for date range")
    public ResponseEntity<List<TransactionSummaryDto>> getTransactionSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TransactionSummaryDto> summary = transactionService.getTransactionSummary(startDate, endDate);
        return ResponseEntity.ok(summary);
    }
}
