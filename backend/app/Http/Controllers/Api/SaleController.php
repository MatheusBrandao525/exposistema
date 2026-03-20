<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Services\SalesService;
use App\Services\ReceiptService;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    protected $salesService;
    protected $receiptService;

    public function __construct(SalesService $salesService, ReceiptService $receiptService)
    {
        $this->salesService = $salesService;
        $this->receiptService = $receiptService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Sale::with(['adSpace', 'client', 'user'])->paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'ad_space_id' => 'required|exists:ad_spaces,id',
            'client_id' => 'required|exists:clients,id',
            'negotiated_price' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'total_installments' => 'required|integer|min:1',
            'purchase_date' => 'required|date',
        ]);

        // Seller ID of current authenticated user
        $validated['user_id'] = $request->user()?->id ?? 1; // Default to 1 for demo

        return $this->salesService->createSale($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        return $sale->load(['adSpace', 'client', 'user', 'payments']);
    }

    /**
     * Generate PDF Receipt.
     */
    public function receipt(Sale $sale)
    {
        $pdf = $this->receiptService->generateReceipt($sale);
        
        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="receipt-' . $sale->id . '.pdf"'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        $sale->delete();
        return response()->noContent();
    }
}
