"use client"

import React, { useEffect, useState } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import PDFReport from "./pdf-report"
import { Activity } from "@/types"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

interface PDFReportButtonProps {
  username: string
  points: number
  streak: number
  totalCO2: number
  breakdown: { name: string; value: number }[]
  recentActivities: Activity[]
}

export default function PDFReportButton(props: PDFReportButtonProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Button 
        variant="outline" 
        className="border-emerald-600/35 text-emerald-800 dark:text-emerald-400" 
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Preparing PDF...
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={<PDFReport {...props} />}
      fileName={`ecotrack-report-${props.username}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <Button
          variant="outline"
          className="border-emerald-600/35 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50/50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export PDF Report
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
