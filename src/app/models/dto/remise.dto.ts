// --- REMISE DTO ---
export interface RemiseDto {
    type_rem: string;
    id_rem: string;
    rm_libelle: string;
    rm_rem: number;
    rm_tar: number | null;
    rm_tmo: number;
    rm_tmo_lib: string;
    rm_prix: number;
    date_maj: string;
    date_mep: string;
}
