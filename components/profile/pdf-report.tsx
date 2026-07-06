"use client"

import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { Activity } from "@/types"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#fafdfb",
  },
  header: {
    borderBottom: "2px solid #059669",
    paddingBottom: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#065f46",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  cardTitle: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#047857",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 4,
    marginBottom: 10,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: "1px solid #f1f5f9",
    fontSize: 10,
  },
  metricLabel: {
    color: "#4b5563",
  },
  metricValue: {
    fontWeight: "bold",
    color: "#1f2937",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #9ca3af",
    paddingBottom: 5,
    marginBottom: 5,
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e2e8f0",
    paddingVertical: 6,
    fontSize: 9,
    color: "#4b5563",
    paddingHorizontal: 4,
  },
  colCategory: { flex: 2 },
  colSubcategory: { flex: 3 },
  colAmount: { flex: 2, textAlign: "right" },
  colCO2: { flex: 2, textAlign: "right", fontWeight: "bold" },
  colDate: { flex: 2, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 10,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
})

interface PDFReportProps {
  username: string
  points: number
  streak: number
  totalCO2: number
  breakdown: { name: string; value: number }[]
  recentActivities: Activity[]
}

export default function PDFReport({
  username,
  points,
  streak,
  totalCO2,
  breakdown,
  recentActivities,
}: PDFReportProps) {
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bhoomija Carbon Footprint Report</Text>
          <Text style={styles.subtitle}>Generated for @{username} on {dateStr}</Text>
        </View>

        {/* Aggregated stats row */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Net Carbon Footprint</Text>
            <Text style={styles.cardValue}>{totalCO2.toFixed(1)} kg CO₂e</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Eco Points</Text>
            <Text style={styles.cardValue}>{points} pts</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Streak</Text>
            <Text style={styles.cardValue}>{streak} Days</Text>
          </View>
        </View>

        {/* Breakdown by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emission Breakdown by Category</Text>
          {breakdown.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.metricLabel}>{item.name}</Text>
              <Text style={styles.metricValue}>{item.value.toFixed(1)} kg CO₂e</Text>
            </View>
          ))}
        </View>

        {/* Recent Activities list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity Logs (Last 30 Days)</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colCategory}>Category</Text>
            <Text style={styles.colSubcategory}>Activity Type</Text>
            <Text style={styles.colAmount}>Amount</Text>
            <Text style={styles.colCO2}>CO₂ (kg)</Text>
            <Text style={styles.colDate}>Date</Text>
          </View>

          {/* Table Rows */}
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.slice(0, 10).map((act, idx) => {
              const formattedDate = new Date(act.logged_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
              const isOffset = act.category === "sustainable_action"

              return (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.colCategory, { textTransform: "capitalize" }]}>
                    {act.category.replace("_", " ")}
                  </Text>
                  <Text style={[styles.colSubcategory, { textTransform: "capitalize" }]}>
                    {act.subcategory.replace("_", " ")}
                  </Text>
                  <Text style={styles.colAmount}>
                    {act.amount} {act.unit}
                  </Text>
                  <Text style={[styles.colCO2, { color: isOffset ? "#10b981" : "#ef4444" }]}>
                    {isOffset ? "-" : ""}{Number(act.co2_emission).toFixed(1)}
                  </Text>
                  <Text style={styles.colDate}>{formattedDate}</Text>
                </View>
              )
            })
          ) : (
            <Text style={{ fontSize: 9, color: "#94a3b8", textAlign: "center", marginTop: 10 }}>
              No activities logged during this billing cycle.
            </Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}  |  Bhoomija - Towards a Net-Zero Future`
        )} />
      </Page>
    </Document>
  )
}
