<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\AdSpace;
use Illuminate\Support\Facades\DB;
use Exception;

class SalesService
{
    public function createSale(array $data)
    {
        return DB::transaction(function() use ($data) {
            $adSpace = AdSpace::findOrFail($data['ad_space_id']);

            if ($adSpace->status !== 'available') {
                throw new Exception('Espaço não está disponível.');
            }

            $sale = Sale::create($data);

            $adSpace->update(['status' => 'sold']);

            // Sync Audit Log (Direct DB insert)
            \App\Models\AuditLog::create([
                'user_id' => $data['user_id'] ?? 1,
                'action' => 'sale_created',
                'description' => "Venda do espaço {$adSpace->name} para o cliente ID {$data['client_id']}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $sale;
        });
    }
}
