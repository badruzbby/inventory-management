package com.inventory.management.backend.repository;

import com.inventory.management.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByProductIdOrderByTransactionDateDesc(Long productId);
    
    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);
    
    List<Transaction> findByTypeOrderByTransactionDateDesc(Transaction.TransactionType type);
    
    List<Transaction> findBySupplierIdOrderByTransactionDateDesc(Long supplierId);
    
    @Query("SELECT t FROM Transaction t WHERE t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM Transaction t WHERE t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByTypeAndDateRange(@Param("type") Transaction.TransactionType type, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(t.quantity) FROM Transaction t WHERE t.product.id = :productId AND t.type = :type")
    Integer getTotalQuantityByProductAndType(@Param("productId") Long productId, @Param("type") Transaction.TransactionType type);
    
    @Query("SELECT DATE(t.transactionDate) as date, " +
           "COUNT(t) as totalTransactions, " +
           "SUM(CASE WHEN t.type = 'IN' THEN 1 ELSE 0 END) as inTransactions, " +
           "SUM(CASE WHEN t.type = 'OUT' THEN 1 ELSE 0 END) as outTransactions, " +
           "SUM(CASE WHEN t.type = 'IN' THEN t.totalPrice ELSE 0 END) as totalInValue, " +
           "SUM(CASE WHEN t.type = 'OUT' THEN t.totalPrice ELSE 0 END) as totalOutValue " +
           "FROM Transaction t WHERE t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(t.transactionDate) ORDER BY DATE(t.transactionDate)")
    List<Object[]> getTransactionSummaryByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
