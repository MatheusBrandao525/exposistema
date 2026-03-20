<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdSpace;
use Illuminate\Http\Request;

class AdSpaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AdSpace::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type_id')) {
            $query->where('ad_space_type_id', $request->type_id);
        }

        return $query->with('adSpaceType')->paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'ad_space_type_id' => 'required|exists:ad_space_types,id',
            'name' => 'required|string|max:255',
            'location' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
        ]);

        return AdSpace::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(AdSpace $adSpace)
    {
        return $adSpace->load(['adSpaceType', 'event']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AdSpace $adSpace)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string',
            'status' => 'sometimes|in:available,reserved,sold',
            'base_price' => 'sometimes|numeric|min:0',
        ]);

        $adSpace->update($validated);

        return $adSpace;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdSpace $adSpace)
    {
        $adSpace->delete();
        return response()->noContent();
    }
}
