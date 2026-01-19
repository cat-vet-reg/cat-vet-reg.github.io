
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root'
})
export class CatService {

    constructor(private supabase: SupabaseService) { }

    async getCats() {
        const { data, error } = await this.supabase.client
            .from('td_records')
            .select(`
            *,
            owner:td_owners(name, phone)
        `);

        if (error) {
            console.error("Грешка при вземане на котките:", error);
            return { data: [] };
        }

        const formattedData = data.map((cat: any) => ({
            ...cat,
            owner_name: cat.owner?.name,
            owner_phone: cat.owner?.phone,
            address: cat.location_address
        }));

        return { data: formattedData };
    }

    // TODO: Add createNewRecord implementation when migrating the form
}
