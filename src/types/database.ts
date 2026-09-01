// Tipos manuales que reflejan supabase/schema.sql.
// Si más adelante generas tipos con `supabase gen types typescript`, puedes
// reemplazar este archivo por el generado sin tocar el resto del código,
// siempre que mantengas los mismos nombres de tabla/columnas.

import type { CvProfile, JobRequirements, TailoredCvContent } from "./domain";

export interface Database {
  public: {
    Tables: {
      base_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          original_file_path: string;
          original_file_name: string;
          raw_text: string;
          parsed: CvProfile;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          original_file_path: string;
          original_file_name: string;
          raw_text: string;
          parsed: CvProfile;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["base_profiles"]["Insert"]>;
        Relationships: [];
      };
      job_offers: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          title: string;
          source_url: string | null;
          raw_description: string;
          parsed: JobRequirements | Record<string, never>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company: string;
          title: string;
          source_url?: string | null;
          raw_description: string;
          parsed?: JobRequirements | Record<string, never>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_offers"]["Insert"]>;
        Relationships: [];
      };
      tailored_cvs: {
        Row: {
          id: string;
          user_id: string;
          base_profile_id: string;
          job_offer_id: string;
          content: TailoredCvContent;
          match_score: number;
          matched_keywords: string[];
          missing_keywords: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          base_profile_id: string;
          job_offer_id: string;
          content: TailoredCvContent;
          match_score: number;
          matched_keywords: string[];
          missing_keywords: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tailored_cvs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
