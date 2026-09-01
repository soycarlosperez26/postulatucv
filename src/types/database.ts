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
      credit_packs: {
        Row: {
          id: string;
          credits: number;
          amount_cop: number;
          label: string;
          sort_order: number;
          active: boolean;
        };
        Insert: Database["public"]["Tables"]["credit_packs"]["Row"];
        Update: Partial<Database["public"]["Tables"]["credit_packs"]["Row"]>;
        Relationships: [];
      };
      user_credits: {
        Row: {
          user_id: string;
          free_credits: number;
          free_period: string;
          purchased_credits: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          free_credits?: number;
          free_period?: string;
          purchased_credits?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_credits"]["Insert"]>;
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          kind: "free_grant" | "purchase" | "consume" | "refund";
          amount: number;
          balance_after: number;
          reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: Database["public"]["Tables"]["credit_transactions"]["Row"]["kind"];
          amount: number;
          balance_after: number;
          reference?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["credit_transactions"]["Insert"]
        >;
        Relationships: [];
      };
      credit_orders: {
        Row: {
          id: string;
          user_id: string;
          pack_id: string;
          credits: number;
          amount_cop: number;
          reference: string;
          status: "pending" | "approved" | "declined" | "voided" | "error";
          channel: "whatsapp" | "wompi";
          wompi_transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pack_id: string;
          credits: number;
          amount_cop: number;
          reference: string;
          status?: Database["public"]["Tables"]["credit_orders"]["Row"]["status"];
          channel?: Database["public"]["Tables"]["credit_orders"]["Row"]["channel"];
          wompi_transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["credit_orders"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_credit_balance: {
        Args: Record<string, never>;
        Returns: { free: number; purchased: number; total: number }[];
      };
      consume_credit: {
        Args: { p_reference: string };
        Returns: boolean;
      };
      refund_credit: {
        Args: { p_reference: string };
        Returns: boolean;
      };
      create_credit_order: {
        Args: { p_pack_id: string; p_channel?: string };
        Returns: Database["public"]["Tables"]["credit_orders"]["Row"];
      };
      /** Solo service role: acredita una compra confirmada por el webhook. */
      grant_purchased_credits: {
        Args: { p_user_id: string; p_amount: number; p_reference: string };
        Returns: boolean;
      };
      /** Solo service role: solicitudes de recarga sin resolver. */
      list_pending_orders: {
        Args: Record<string, never>;
        Returns: Array<{
          reference: string;
          email: string;
          pack_id: string;
          credits: number;
          amount_cop: number;
          channel: string;
          created_at: string;
        }>;
      };
      /** Solo service role: acredita una recarga pagada por fuera. */
      approve_manual_order: {
        Args: { p_reference: string };
        Returns: boolean;
      };
      /** Solo service role: descarta una solicitud no pagada. */
      reject_manual_order: {
        Args: { p_reference: string };
        Returns: boolean;
      };
    };
  };
}
