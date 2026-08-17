'use client';

import React, { useState } from 'react';
import { TORContract } from '@/types';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles
} from 'lucide-react';

interface PDFReaderProps {
  contract: TORContract;
  onDownload: () => void;
}

export const PDFReader: React.FC<PDFReaderProps> = ({ contract, onDownload }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [highlightAI, setHighlightAI] = useState<boolean>(true);

  const handleNextPage = () => {
    if (currentPage < contract.pdfPagesCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
      
      {/* PDF Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
        
        {/* Left Toolbar Items */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="truncate max-w-[200px]">{contract.id}.pdf</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Page <span className="text-sky-600 dark:text-sky-400 font-bold">{currentPage}</span> / {contract.pdfPagesCount}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === contract.pdfPagesCount}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: AI Highlight Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Highlight AI คุณสมบัติ</span>
          <button
            onClick={() => setHighlightAI(!highlightAI)}
            className={`w-8 h-4 rounded-full transition-colors relative ${
              highlightAI ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                highlightAI ? 'left-4.5 translate-x-1' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Right Toolbar Items: Zoom & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 w-10 text-center">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <button
            onClick={onDownload}
            className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-lg text-[11px] font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* PDF Document Viewing Container */}
      <div className="flex-1 overflow-auto p-6 bg-slate-100 dark:bg-slate-950 flex justify-center">
        <div 
          className="bg-white text-slate-900 shadow-xl rounded-sm p-8 sm:p-12 transition-transform duration-200 origin-top font-serif max-w-3xl w-full border border-slate-300 relative min-h-[700px]"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >

          {/* Official Document Header Emblem */}
          <div className="text-center mb-6 border-b border-slate-300 pb-4">
            <div className="w-12 h-12 mx-auto mb-2 text-slate-800 flex items-center justify-center font-bold text-lg border-2 border-slate-800 rounded-full">
              กทม
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide font-sans mb-1">
              เอกสารข้อกำหนดรายละเอียดและขอบเขตของงาน (TOR)
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              สัญญาเลขที่ {contract.id.toUpperCase()}-BKK-2026 • ออกโดย: {contract.contractOwner}
            </p>
          </div>

          {/* Page Content based on selected page */}
          {currentPage === 1 ? (
            <div className="space-y-4 text-sm leading-relaxed text-slate-800 font-sans">
              <div>
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  1. วัตถุประสงค์ (Purpose & Requirements)
                </h3>
                <p className="text-xs text-slate-700">
                  {contract.description}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  2. วงเงินงบประมาณและการดำเนินงาน (Price & Schedule)
                </h3>
                <table className="w-full text-xs text-left border-collapse border border-slate-300 my-2">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold bg-slate-100 w-1/3">วงเงินงบประมาณ (Price):</td>
                      <td className="p-2 font-bold text-sky-800">{contract.priceFormatted}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold bg-slate-100">ระยะเวลาสัญญา:</td>
                      <td className="p-2">{contract.startDate} ถึง {contract.endDate}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-slate-100">กำหนดวันยื่นเอกสาร:</td>
                      <td className="p-2 text-rose-700 font-semibold">{contract.submissionDeadline}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Requirement Section highlighted with Vertex AI markers */}
              <div>
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  3. คุณสมบัติของผู้เสนอราคา (Qualifications & Properties)
                </h3>
                <div className="space-y-2">
                  {contract.properties.map((prop, idx) => (
                    <div 
                      key={prop.id || idx}
                      className={`p-2.5 rounded text-xs border transition-colors ${
                        highlightAI 
                          ? prop.fulfilledBySoftwareHouse 
                            ? 'bg-sky-50 border-sky-300 text-sky-950 font-medium' 
                            : 'bg-slate-100 border-slate-300 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-0.5">
                        <span>ข้อ 3.{idx + 1} {prop.property}</span>
                        {highlightAI && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            prop.fulfilledBySoftwareHouse ? 'bg-sky-200 text-sky-900' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {prop.fulfilledBySoftwareHouse ? '✓ Qualified' : '⚠ Missing Tag'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700 font-sans">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-1 mb-2">
                หน้า {currentPage}: ข้อกำหนดทางเทคนิคสถาปัตยกรรม (Technical Specifications)
              </h3>
              <p>
                ผู้เสนอราคาจะต้องดำเนินการออกแบบ สถาปัตยกรรมซอฟต์แวร์ และส่งมอบคู่มือการติดตั้งและซอร์สโค้ด (Source Code) 
                ทั้งหมดให้แก่ {contract.contractOwner} ภายในกำหนดเวลาดำเนินงาน.
              </p>
              <div className="p-4 bg-slate-100 rounded border border-slate-300 text-slate-600 font-mono text-[11px]">
                [PDF Content Page {currentPage} Preview - Technical Architecture & Security Protocols]
              </div>
            </div>
          )}

          {/* Watermark Notice */}
          <div className="absolute bottom-4 right-6 text-[10px] text-slate-400 font-sans flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>Bangkok TOR Platform • PDF Reader View</span>
          </div>

        </div>
      </div>

    </div>
  );
};
