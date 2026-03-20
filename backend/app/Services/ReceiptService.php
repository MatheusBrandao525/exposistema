<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Sale;

class ReceiptService
{
    /**
     * Generate PDF output for a given sale.
     * Synchronous process suitable for shared hosting.
     */
    public function generateReceipt(Sale $sale)
    {
        $data = [
            'sale' => $sale->load(['adSpace', 'client', 'user']),
            'date' => date('d/m/Y H:i:s'),
            'qr_code_link' => config('app.url') . '/verify/' . $sale->id
        ];

        // This runs synchronously and outputs the PDF content directly
        $pdf = Pdf::loadView('receipts.standard', $data);
        
        return $pdf->output();
    }
}
