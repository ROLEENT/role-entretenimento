export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          actor_id: string
          created_at: string
          data: Json | null
          id: string
          object_id: string | null
          object_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          data?: Json | null
          id?: string
          object_id?: string | null
          object_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          data?: Json | null
          id?: string
          object_id?: string | null
          object_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_email: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_email: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_email?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          last_used_at: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_used_at?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_used_at?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          locked_until: string | null
          login_attempts: number | null
          password_hash: string
          password_salt: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          password_hash: string
          password_salt?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          password_hash?: string
          password_salt?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          active: boolean | null
          badge_text: string | null
          created_at: string
          cta_text: string
          cta_url: string | null
          description: string | null
          gradient_from: string | null
          gradient_to: string | null
          id: string
          image_url: string | null
          position: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          badge_text?: string | null
          created_at?: string
          cta_text: string
          cta_url?: string | null
          description?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_url?: string | null
          position?: number | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          badge_text?: string | null
          created_at?: string
          cta_text?: string
          cta_url?: string | null
          description?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_url?: string | null
          position?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          city: string | null
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          source: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      approved_admins: {
        Row: {
          approved_by: string
          created_at: string
          email: string
          id: string
          is_active: boolean
        }
        Insert: {
          approved_by: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
        }
        Update: {
          approved_by?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      artist_discovery_log: {
        Row: {
          artist_spotify_data_id: string
          discovered_at: string
          event_id: string
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          artist_spotify_data_id: string
          discovered_at?: string
          event_id: string
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          artist_spotify_data_id?: string
          discovered_at?: string
          event_id?: string
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_discovery_log_artist_spotify_data_id_fkey"
            columns: ["artist_spotify_data_id"]
            isOneToOne: false
            referencedRelation: "artist_spotify_data"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_spotify_data: {
        Row: {
          artist_name: string
          created_at: string
          followers_count: number | null
          genres: string[] | null
          id: string
          image_url: string | null
          popularity: number | null
          preview_tracks: Json | null
          spotify_id: string
          spotify_url: string
          updated_at: string
        }
        Insert: {
          artist_name: string
          created_at?: string
          followers_count?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          popularity?: number | null
          preview_tracks?: Json | null
          spotify_id: string
          spotify_url: string
          updated_at?: string
        }
        Update: {
          artist_name?: string
          created_at?: string
          followers_count?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          popularity?: number | null
          preview_tracks?: Json | null
          spotify_id?: string
          spotify_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          accommodation_notes: string | null
          artist_type: string
          audius_url: string | null
          availability_days: string[] | null
          beatport_url: string | null
          bio_long: string | null
          bio_short: string
          booking_email: string
          booking_whatsapp: string
          cities_active: string[] | null
          city: string
          cover_image_url: string | null
          created_at: string | null
          fee_range: string | null
          home_city: string | null
          id: string
          image_credits: string | null
          image_rights_authorized: boolean | null
          instagram: string
          internal_notes: string | null
          presskit_url: string | null
          priority: number | null
          profile_image_url: string
          pronouns: string | null
          real_name: string | null
          responsible_name: string | null
          responsible_role: string | null
          set_time_minutes: number | null
          show_format: string | null
          slug: string
          soundcloud_url: string | null
          spotify_url: string | null
          stage_name: string
          status: string | null
          team_size: number | null
          tech_audio: string | null
          tech_light: string | null
          tech_rider_url: string | null
          tech_stage: string | null
          updated_at: string | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          accommodation_notes?: string | null
          artist_type: string
          audius_url?: string | null
          availability_days?: string[] | null
          beatport_url?: string | null
          bio_long?: string | null
          bio_short: string
          booking_email: string
          booking_whatsapp: string
          cities_active?: string[] | null
          city: string
          cover_image_url?: string | null
          created_at?: string | null
          fee_range?: string | null
          home_city?: string | null
          id?: string
          image_credits?: string | null
          image_rights_authorized?: boolean | null
          instagram: string
          internal_notes?: string | null
          presskit_url?: string | null
          priority?: number | null
          profile_image_url: string
          pronouns?: string | null
          real_name?: string | null
          responsible_name?: string | null
          responsible_role?: string | null
          set_time_minutes?: number | null
          show_format?: string | null
          slug: string
          soundcloud_url?: string | null
          spotify_url?: string | null
          stage_name: string
          status?: string | null
          team_size?: number | null
          tech_audio?: string | null
          tech_light?: string | null
          tech_rider_url?: string | null
          tech_stage?: string | null
          updated_at?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          accommodation_notes?: string | null
          artist_type?: string
          audius_url?: string | null
          availability_days?: string[] | null
          beatport_url?: string | null
          bio_long?: string | null
          bio_short?: string
          booking_email?: string
          booking_whatsapp?: string
          cities_active?: string[] | null
          city?: string
          cover_image_url?: string | null
          created_at?: string | null
          fee_range?: string | null
          home_city?: string | null
          id?: string
          image_credits?: string | null
          image_rights_authorized?: boolean | null
          instagram?: string
          internal_notes?: string | null
          presskit_url?: string | null
          priority?: number | null
          profile_image_url?: string
          pronouns?: string | null
          real_name?: string | null
          responsible_name?: string | null
          responsible_role?: string | null
          set_time_minutes?: number | null
          show_format?: string | null
          slug?: string
          soundcloud_url?: string | null
          spotify_url?: string | null
          stage_name?: string
          status?: string | null
          team_size?: number | null
          tech_audio?: string | null
          tech_light?: string | null
          tech_rider_url?: string | null
          tech_stage?: string | null
          updated_at?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          color: string
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          points_required: number | null
          type: Database["public"]["Enums"]["badge_type"]
        }
        Insert: {
          color?: string
          created_at?: string
          criteria?: Json
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          points_required?: number | null
          type: Database["public"]["Enums"]["badge_type"]
        }
        Update: {
          color?: string
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          points_required?: number | null
          type?: Database["public"]["Enums"]["badge_type"]
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          display_name: string | null
          email_hash: string
          id: string
          is_approved: boolean
          is_hidden: boolean | null
          parent_id: string | null
          post_id: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          display_name?: string | null
          email_hash: string
          id?: string
          is_approved?: boolean
          is_hidden?: boolean | null
          parent_id?: string | null
          post_id: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          display_name?: string | null
          email_hash?: string
          id?: string
          is_approved?: boolean
          is_hidden?: boolean | null
          parent_id?: string | null
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_likes: {
        Row: {
          created_at: string
          email_hash: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          email_hash: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          email_hash?: string
          id?: string
          post_id?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_revisions: {
        Row: {
          change_description: string | null
          content_json: Json
          created_at: string
          created_by: string | null
          id: string
          post_id: string
          revision_number: number
          summary: string | null
          title: string | null
        }
        Insert: {
          change_description?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          post_id: string
          revision_number?: number
          summary?: string | null
          title?: string | null
        }
        Update: {
          change_description?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          post_id?: string
          revision_number?: number
          summary?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_revisions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          author_name: string
          category_ids: string[] | null
          city: string
          content_html: string
          cover_image: string
          created_at: string
          featured: boolean | null
          id: string
          published_at: string | null
          reading_time: number | null
          scheduled_at: string | null
          slug: string
          slug_data: string
          status: Database["public"]["Enums"]["article_status"]
          summary: string
          tags: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id: string
          author_name: string
          category_ids?: string[] | null
          city: string
          content_html: string
          cover_image: string
          created_at?: string
          featured?: boolean | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          slug: string
          slug_data: string
          status?: Database["public"]["Enums"]["article_status"]
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string
          author_name?: string
          category_ids?: string[] | null
          city?: string
          content_html?: string
          cover_image?: string
          created_at?: string
          featured?: boolean | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          slug?: string
          slug_data?: string
          status?: Database["public"]["Enums"]["article_status"]
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          color_hex: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          type: Database["public"]["Enums"]["category_type"] | null
        }
        Insert: {
          color?: string | null
          color_hex?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          type?: Database["public"]["Enums"]["category_type"] | null
        }
        Update: {
          color?: string | null
          color_hex?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          type?: Database["public"]["Enums"]["category_type"] | null
        }
        Relationships: []
      }
      companion_responses: {
        Row: {
          companion_request_id: string
          created_at: string
          id: string
          message: string | null
          status: string
          user_id: string
        }
        Insert: {
          companion_request_id: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          user_id: string
        }
        Update: {
          companion_request_id?: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companion_responses_companion_request_id_fkey"
            columns: ["companion_request_id"]
            isOneToOne: false
            referencedRelation: "event_companions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          body: string | null
          created_at: string
          email_hash: string | null
          handled: boolean | null
          handled_by: string | null
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          email_hash?: string | null
          handled?: boolean | null
          handled_by?: string | null
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          body?: string | null
          created_at?: string
          email_hash?: string | null
          handled?: boolean | null
          handled_by?: string | null
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      event_artists: {
        Row: {
          artist_spotify_data_id: string
          created_at: string
          event_id: string
          id: string
          is_main_artist: boolean | null
        }
        Insert: {
          artist_spotify_data_id: string
          created_at?: string
          event_id: string
          id?: string
          is_main_artist?: boolean | null
        }
        Update: {
          artist_spotify_data_id?: string
          created_at?: string
          event_id?: string
          id?: string
          is_main_artist?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_artists_artist_spotify_data_id_fkey"
            columns: ["artist_spotify_data_id"]
            isOneToOne: false
            referencedRelation: "artist_spotify_data"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          category_id: string
          created_at: string
          event_id: string
          id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          event_id: string
          id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_checkins: {
        Row: {
          checked_in_at: string
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_comments: {
        Row: {
          content: string
          created_at: string
          event_id: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "event_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      event_companions: {
        Row: {
          companions_needed: number
          contact_info: string | null
          contact_preference: string
          created_at: string
          event_id: string
          id: string
          is_active: boolean
          message: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          companions_needed?: number
          contact_info?: string | null
          contact_preference?: string
          created_at?: string
          event_id: string
          id?: string
          is_active?: boolean
          message?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          companions_needed?: number
          contact_info?: string | null
          contact_preference?: string
          created_at?: string
          event_id?: string
          id?: string
          is_active?: boolean
          message?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_companions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_engagement: {
        Row: {
          created_at: string
          engagement_type: string
          event_id: string | null
          highlight_id: string | null
          id: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engagement_type: string
          event_id?: string | null
          highlight_id?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          engagement_type?: string
          event_id?: string | null
          highlight_id?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_engagement_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_engagement_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "highlights"
            referencedColumns: ["id"]
          },
        ]
      }
      event_favorites: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reviews: {
        Row: {
          comment: string | null
          created_at: string
          event_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string
          cover_url: string | null
          created_at: string
          date_end: string | null
          date_start: string
          description: string | null
          end_at: string | null
          external_url: string | null
          id: string
          image_url: string | null
          organizer_id: string | null
          price_max: number | null
          price_min: number | null
          slug: string | null
          source: string | null
          start_at: string | null
          state: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          city: string
          cover_url?: string | null
          created_at?: string
          date_end?: string | null
          date_start: string
          description?: string | null
          end_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string | null
          price_max?: number | null
          price_min?: number | null
          slug?: string | null
          source?: string | null
          start_at?: string | null
          state: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          city?: string
          cover_url?: string | null
          created_at?: string
          date_end?: string | null
          date_start?: string
          description?: string | null
          end_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string | null
          price_max?: number | null
          price_min?: number | null
          slug?: string | null
          source?: string | null
          start_at?: string | null
          state?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      group_event_participants: {
        Row: {
          group_event_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          group_event_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          group_event_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_event_participants_group_event_id_fkey"
            columns: ["group_event_id"]
            isOneToOne: false
            referencedRelation: "group_events"
            referencedColumns: ["id"]
          },
        ]
      }
      group_events: {
        Row: {
          created_at: string
          created_by: string
          current_participants_count: number
          date_end: string | null
          date_start: string
          description: string | null
          event_id: string | null
          group_id: string
          id: string
          location: string | null
          max_participants: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_participants_count?: number
          date_end?: string | null
          date_start: string
          description?: string | null
          event_id?: string | null
          group_id: string
          id?: string
          location?: string | null
          max_participants?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_participants_count?: number
          date_end?: string | null
          date_start?: string
          description?: string | null
          event_id?: string | null
          group_id?: string
          id?: string
          location?: string | null
          max_participants?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          message_type: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          message_type?: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category: string
          city: string
          created_at: string
          created_by: string
          current_members_count: number
          description: string | null
          id: string
          image_url: string | null
          is_public: boolean
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          city: string
          created_at?: string
          created_by: string
          current_members_count?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          city?: string
          created_at?: string
          created_by?: string
          current_members_count?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      highlight_comments: {
        Row: {
          content: string
          created_at: string
          highlight_id: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          highlight_id: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          highlight_id?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      highlight_likes: {
        Row: {
          created_at: string
          highlight_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          highlight_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          highlight_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      highlight_reviews: {
        Row: {
          comment: string | null
          created_at: string
          highlight_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          highlight_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          highlight_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      highlights: {
        Row: {
          city: Database["public"]["Enums"]["city"]
          created_at: string
          event_date: string | null
          event_time: string | null
          event_title: string
          id: string
          image_url: string
          is_published: boolean
          like_count: number
          photo_credit: string | null
          role_text: string
          selection_reasons: string[]
          sort_order: number | null
          ticket_price: string | null
          ticket_url: string | null
          updated_at: string
          venue: string
        }
        Insert: {
          city: Database["public"]["Enums"]["city"]
          created_at?: string
          event_date?: string | null
          event_time?: string | null
          event_title: string
          id?: string
          image_url: string
          is_published?: boolean
          like_count?: number
          photo_credit?: string | null
          role_text: string
          selection_reasons?: string[]
          sort_order?: number | null
          ticket_price?: string | null
          ticket_url?: string | null
          updated_at?: string
          venue: string
        }
        Update: {
          city?: Database["public"]["Enums"]["city"]
          created_at?: string
          event_date?: string | null
          event_time?: string | null
          event_title?: string
          id?: string
          image_url?: string
          is_published?: boolean
          like_count?: number
          photo_credit?: string | null
          role_text?: string
          selection_reasons?: string[]
          sort_order?: number | null
          ticket_price?: string | null
          ticket_url?: string | null
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      js_errors: {
        Row: {
          column_number: number | null
          created_at: string
          error_message: string
          error_stack: string | null
          id: string
          line_number: number | null
          page_url: string
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          column_number?: number | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          id?: string
          line_number?: number | null
          page_url: string
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          column_number?: number | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          id?: string
          line_number?: number | null
          page_url?: string
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      metrics: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          key: string
          label: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          key: string
          label: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          key?: string
          label?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      music_categories: {
        Row: {
          color_hex: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          content_html: string
          content_text: string | null
          created_at: string
          created_by: string | null
          id: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          target_audience: Json | null
          template_type: string | null
          title: string
          total_clicked: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
          updated_at: string
        }
        Insert: {
          content_html: string
          content_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          target_audience?: Json | null
          template_type?: string | null
          title: string
          total_clicked?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Update: {
          content_html?: string
          content_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          target_audience?: Json | null
          template_type?: string | null
          title?: string
          total_clicked?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          city: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          preferences: Json | null
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          preferences?: Json | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          preferences?: Json | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_analytics: {
        Row: {
          avg_delivery_time_ms: number | null
          city: string | null
          created_at: string
          date: string
          id: string
          notification_type: string
          target_audience: string | null
          total_clicked: number
          total_delivered: number
          total_failed: number
          total_opened: number
          total_sent: number
          total_unsubscribed: number
          updated_at: string
        }
        Insert: {
          avg_delivery_time_ms?: number | null
          city?: string | null
          created_at?: string
          date: string
          id?: string
          notification_type: string
          target_audience?: string | null
          total_clicked?: number
          total_delivered?: number
          total_failed?: number
          total_opened?: number
          total_sent?: number
          total_unsubscribed?: number
          updated_at?: string
        }
        Update: {
          avg_delivery_time_ms?: number | null
          city?: string | null
          created_at?: string
          date?: string
          id?: string
          notification_type?: string
          target_audience?: string | null
          total_clicked?: number
          total_delivered?: number
          total_failed?: number
          total_opened?: number
          total_sent?: number
          total_unsubscribed?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          message: string
          name: string
          notification_type: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_audience: string
          target_cities: string[] | null
          target_event_id: string | null
          title: string
          total_clicked: number | null
          total_delivered: number | null
          total_failed: number | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          message: string
          name: string
          notification_type: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience: string
          target_cities?: string[] | null
          target_event_id?: string | null
          title: string
          total_clicked?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          message?: string
          name?: string
          notification_type?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: string
          target_cities?: string[] | null
          target_event_id?: string | null
          title?: string
          total_clicked?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          campaign_id: string | null
          city: string | null
          created_at: string
          delivery_time_ms: number | null
          device_type: string | null
          error_message: string | null
          event_id: string | null
          id: string
          message: string
          notification_id: string | null
          notification_type: string
          status: string
          subscription_id: string | null
          target_audience: string | null
          title: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          city?: string | null
          created_at?: string
          delivery_time_ms?: number | null
          device_type?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          message: string
          notification_id?: string | null
          notification_type: string
          status: string
          subscription_id?: string | null
          target_audience?: string | null
          title: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          city?: string | null
          created_at?: string
          delivery_time_ms?: number | null
          device_type?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          message?: string
          notification_id?: string | null
          notification_type?: string
          status?: string
          subscription_id?: string | null
          target_audience?: string | null
          title?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organizers: {
        Row: {
          contact_email: string
          created_at: string
          id: string
          instagram: string | null
          name: string
          site: string | null
          updated_at: string
        }
        Insert: {
          contact_email: string
          created_at?: string
          id?: string
          instagram?: string | null
          name: string
          site?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          id?: string
          instagram?: string | null
          name?: string
          site?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          capacity: string | null
          contact_email: string | null
          created_at: string
          featured: boolean | null
          id: string
          image_url: string | null
          instagram: string | null
          location: string
          name: string
          rating: number | null
          types: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          capacity?: string | null
          contact_email?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          location: string
          name: string
          rating?: number | null
          types?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          capacity?: string | null
          contact_email?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          location?: string
          name?: string
          rating?: number | null
          types?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      perf_metrics: {
        Row: {
          connection_type: string | null
          created_at: string
          device_memory: number | null
          id: string
          metric_name: string
          metric_value: number
          page_url: string
          session_id: string
          unit: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          connection_type?: string | null
          created_at?: string
          device_memory?: number | null
          id?: string
          metric_name: string
          metric_value: number
          page_url: string
          session_id: string
          unit?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          connection_type?: string | null
          created_at?: string
          device_memory?: number | null
          id?: string
          metric_name?: string
          metric_value?: number
          page_url?: string
          session_id?: string
          unit?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          threshold_critical: number
          threshold_warning: number
          timestamp: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          threshold_critical?: number
          threshold_warning?: number
          timestamp?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          threshold_critical?: number
          threshold_warning?: number
          timestamp?: string
          value?: number
        }
        Relationships: []
      }
      points_history: {
        Row: {
          activity_id: string | null
          activity_type: string
          created_at: string
          description: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          activity_id?: string | null
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          display_name: string | null
          email: string | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          id: string
          is_admin: boolean
          is_verified: boolean | null
          location: string | null
          phone: string | null
          preferences_json: Json
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          preferences_json?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          preferences_json?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          subscription: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          subscription: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          subscription?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          event_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      site_metrics: {
        Row: {
          active_cities: number | null
          captured_at: string | null
          created_at: string | null
          followers_thousands: number | null
          id: string
          is_current: boolean | null
          reach_thousands: number | null
          views_millions: number | null
        }
        Insert: {
          active_cities?: number | null
          captured_at?: string | null
          created_at?: string | null
          followers_thousands?: number | null
          id?: string
          is_current?: boolean | null
          reach_thousands?: number | null
          views_millions?: number | null
        }
        Update: {
          active_cities?: number | null
          captured_at?: string | null
          created_at?: string | null
          followers_thousands?: number | null
          id?: string
          is_current?: boolean | null
          reach_thousands?: number | null
          views_millions?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          name: string
          quote: string
          rating: number | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          quote: string
          rating?: number | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          quote?: string
          rating?: number | null
          role?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          event_id: string
          id: string
          price: number
          stock: number | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          price: number
          stock?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          price?: number
          stock?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_calendar_events: {
        Row: {
          all_day: boolean
          color: string | null
          created_at: string
          description: string | null
          end_datetime: string
          event_id: string | null
          external_calendar_id: string | null
          external_event_id: string | null
          id: string
          is_synced: boolean | null
          location: string | null
          reminder_minutes: number[] | null
          start_datetime: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          end_datetime: string
          event_id?: string | null
          external_calendar_id?: string | null
          external_event_id?: string | null
          id?: string
          is_synced?: boolean | null
          location?: string | null
          reminder_minutes?: number[] | null
          start_datetime: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          end_datetime?: string
          event_id?: string | null
          external_calendar_id?: string | null
          external_event_id?: string | null
          id?: string
          is_synced?: boolean | null
          location?: string | null
          reminder_minutes?: number[] | null
          start_datetime?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_calendar_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_calendar_settings: {
        Row: {
          apple_calendar_enabled: boolean | null
          created_at: string
          default_reminder_minutes: number | null
          google_access_token: string | null
          google_calendar_enabled: boolean | null
          google_calendar_id: string | null
          google_refresh_token: string | null
          id: string
          timezone: string | null
          updated_at: string
          user_id: string
          week_starts_on: number | null
        }
        Insert: {
          apple_calendar_enabled?: boolean | null
          created_at?: string
          default_reminder_minutes?: number | null
          google_access_token?: string | null
          google_calendar_enabled?: boolean | null
          google_calendar_id?: string | null
          google_refresh_token?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
          week_starts_on?: number | null
        }
        Update: {
          apple_calendar_enabled?: boolean | null
          created_at?: string
          default_reminder_minutes?: number | null
          google_access_token?: string | null
          google_calendar_enabled?: boolean | null
          google_calendar_id?: string | null
          google_refresh_token?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
          week_starts_on?: number | null
        }
        Relationships: []
      }
      user_music_preferences: {
        Row: {
          auto_playlist_creation: boolean | null
          created_at: string
          favorite_genres: string[] | null
          id: string
          include_preview_tracks: boolean | null
          notification_new_artists: boolean | null
          playlist_update_frequency: string | null
          preferred_platforms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_playlist_creation?: boolean | null
          created_at?: string
          favorite_genres?: string[] | null
          id?: string
          include_preview_tracks?: boolean | null
          notification_new_artists?: boolean | null
          playlist_update_frequency?: string | null
          preferred_platforms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_playlist_creation?: boolean | null
          created_at?: string
          favorite_genres?: string[] | null
          id?: string
          include_preview_tracks?: boolean | null
          notification_new_artists?: boolean | null
          playlist_update_frequency?: string | null
          preferred_platforms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_music_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          platform: string
          refresh_token: string | null
          scope: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          platform?: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          platform?: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          allowed_end_hour: number
          allowed_start_hour: number
          comment_replies: boolean
          created_at: string
          daily_notification_count: number
          event_reminders: boolean
          id: string
          interested_categories: string[] | null
          last_notification_date: string | null
          max_daily_notifications: number
          new_events: boolean
          preferred_cities: string[] | null
          updated_at: string
          user_id: string
          weekly_highlights: boolean
        }
        Insert: {
          allowed_end_hour?: number
          allowed_start_hour?: number
          comment_replies?: boolean
          created_at?: string
          daily_notification_count?: number
          event_reminders?: boolean
          id?: string
          interested_categories?: string[] | null
          last_notification_date?: string | null
          max_daily_notifications?: number
          new_events?: boolean
          preferred_cities?: string[] | null
          updated_at?: string
          user_id: string
          weekly_highlights?: boolean
        }
        Update: {
          allowed_end_hour?: number
          allowed_start_hour?: number
          comment_replies?: boolean
          created_at?: string
          daily_notification_count?: number
          event_reminders?: boolean
          id?: string
          interested_categories?: string[] | null
          last_notification_date?: string | null
          max_daily_notifications?: number
          new_events?: boolean
          preferred_cities?: string[] | null
          updated_at?: string
          user_id?: string
          weekly_highlights?: boolean
        }
        Relationships: []
      }
      user_playlists: {
        Row: {
          auto_update: boolean | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          last_updated_at: string | null
          platform: string
          platform_playlist_id: string | null
          platform_url: string | null
          playlist_name: string
          playlist_type: string
          track_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_update?: boolean | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          last_updated_at?: string | null
          platform?: string
          platform_playlist_id?: string | null
          platform_url?: string | null
          playlist_name: string
          playlist_type?: string
          track_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_update?: boolean | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          last_updated_at?: string | null
          platform?: string
          platform_playlist_id?: string | null
          platform_url?: string | null
          playlist_name?: string
          playlist_type?: string
          track_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          best_streak: number
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          level: Database["public"]["Enums"]["user_level"]
          monthly_points: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: Database["public"]["Enums"]["user_level"]
          monthly_points?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: Database["public"]["Enums"]["user_level"]
          monthly_points?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          city: string
          contacts_json: Json | null
          cover_url: string | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          map_url: string | null
          name: string
          slug: string | null
          state: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          contacts_json?: Json | null
          cover_url?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          map_url?: string | null
          name: string
          slug?: string | null
          state: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          contacts_json?: Json | null
          cover_url?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          map_url?: string | null
          name?: string
          slug?: string | null
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          city: string | null
          date: string | null
          event_count: number | null
          event_name: string | null
          source: string | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_blog_comment_secure: {
        Args: {
          p_author_email: string
          p_author_name: string
          p_content: string
          p_parent_id?: string
          p_post_id: string
        }
        Returns: string
      }
      add_blog_comment_secure_hash: {
        Args: {
          p_author_name: string
          p_content: string
          p_email_hash: string
          p_parent_id?: string
          p_post_id: string
        }
        Returns: string
      }
      add_favorite_to_calendar: {
        Args: { p_event_id: string; p_user_id: string }
        Returns: string
      }
      add_user_points: {
        Args: {
          p_activity_id?: string
          p_activity_type: string
          p_description?: string
          p_points: number
          p_user_id: string
        }
        Returns: undefined
      }
      admin_create_artist: {
        Args: {
          p_accommodation_notes?: string
          p_admin_email: string
          p_artist_type: string
          p_audius_url?: string
          p_availability_days?: string[]
          p_beatport_url?: string
          p_bio_long?: string
          p_bio_short: string
          p_booking_email: string
          p_booking_whatsapp: string
          p_cities_active?: string[]
          p_city: string
          p_cover_image_url?: string
          p_fee_range?: string
          p_home_city?: string
          p_image_credits?: string
          p_image_rights_authorized?: boolean
          p_instagram: string
          p_internal_notes?: string
          p_presskit_url?: string
          p_priority?: number
          p_profile_image_url: string
          p_pronouns?: string
          p_real_name?: string
          p_responsible_name?: string
          p_responsible_role?: string
          p_set_time_minutes?: number
          p_show_format?: string
          p_slug: string
          p_soundcloud_url?: string
          p_spotify_url?: string
          p_stage_name: string
          p_status?: string
          p_team_size?: number
          p_tech_audio?: string
          p_tech_light?: string
          p_tech_rider_url?: string
          p_tech_stage?: string
          p_website_url?: string
          p_youtube_url?: string
        }
        Returns: {
          accommodation_notes: string
          artist_type: string
          audius_url: string
          availability_days: string[]
          beatport_url: string
          bio_long: string
          bio_short: string
          booking_email: string
          booking_whatsapp: string
          cities_active: string[]
          city: string
          cover_image_url: string
          created_at: string
          fee_range: string
          home_city: string
          id: string
          image_credits: string
          image_rights_authorized: boolean
          instagram: string
          internal_notes: string
          presskit_url: string
          priority: number
          profile_image_url: string
          pronouns: string
          real_name: string
          responsible_name: string
          responsible_role: string
          set_time_minutes: number
          show_format: string
          slug: string
          soundcloud_url: string
          spotify_url: string
          stage_name: string
          status: string
          team_size: number
          tech_audio: string
          tech_light: string
          tech_rider_url: string
          tech_stage: string
          updated_at: string
          website_url: string
          youtube_url: string
        }[]
      }
      admin_create_event: {
        Args:
          | {
              p_city: string
              p_cover_url?: string
              p_description?: string
              p_end_at?: string
              p_organizer_id?: string
              p_slug: string
              p_start_at: string
              p_status?: string
              p_tags?: string[]
              p_title: string
              p_venue_id?: string
            }
          | {
              p_city: string
              p_cover_url?: string
              p_end_at?: string
              p_organizer_id?: string
              p_slug: string
              p_start_at?: string
              p_status?: string
              p_tags?: string[]
              p_title: string
              p_venue_id?: string
            }
        Returns: string
      }
      admin_create_highlight_v3: {
        Args: {
          p_admin_email: string
          p_city: string
          p_event_date: string
          p_event_time: string
          p_event_title: string
          p_image_url: string
          p_is_published: boolean
          p_photo_credit: string
          p_role_text: string
          p_selection_reasons: string[]
          p_sort_order: number
          p_ticket_price: string
          p_ticket_url: string
          p_venue: string
        }
        Returns: Json
      }
      admin_delete_artist: {
        Args: { p_admin_email: string; p_artist_id: string }
        Returns: boolean
      }
      admin_get_artist_by_id: {
        Args: { p_admin_email: string; p_artist_id: string }
        Returns: {
          accommodation_notes: string
          artist_type: string
          audius_url: string
          availability_days: string[]
          beatport_url: string
          bio_long: string
          bio_short: string
          booking_email: string
          booking_whatsapp: string
          cities_active: string[]
          city: string
          cover_image_url: string
          created_at: string
          fee_range: string
          home_city: string
          id: string
          image_credits: string
          image_rights_authorized: boolean
          instagram: string
          internal_notes: string
          presskit_url: string
          priority: number
          profile_image_url: string
          pronouns: string
          real_name: string
          responsible_name: string
          responsible_role: string
          set_time_minutes: number
          show_format: string
          slug: string
          soundcloud_url: string
          spotify_url: string
          stage_name: string
          status: string
          team_size: number
          tech_audio: string
          tech_light: string
          tech_rider_url: string
          tech_stage: string
          updated_at: string
          website_url: string
          youtube_url: string
        }[]
      }
      admin_get_artists: {
        Args: {
          p_admin_email: string
          p_city?: string
          p_search?: string
          p_status?: string
        }
        Returns: {
          accommodation_notes: string
          artist_type: string
          audius_url: string
          availability_days: string[]
          beatport_url: string
          bio_long: string
          bio_short: string
          booking_email: string
          booking_whatsapp: string
          cities_active: string[]
          city: string
          cover_image_url: string
          created_at: string
          fee_range: string
          home_city: string
          id: string
          image_credits: string
          image_rights_authorized: boolean
          instagram: string
          internal_notes: string
          presskit_url: string
          priority: number
          profile_image_url: string
          pronouns: string
          real_name: string
          responsible_name: string
          responsible_role: string
          set_time_minutes: number
          show_format: string
          slug: string
          soundcloud_url: string
          spotify_url: string
          stage_name: string
          status: string
          team_size: number
          tech_audio: string
          tech_light: string
          tech_rider_url: string
          tech_stage: string
          updated_at: string
          website_url: string
          youtube_url: string
        }[]
      }
      admin_get_highlight_by_id_v3: {
        Args: { p_admin_email: string; p_highlight_id: string }
        Returns: Json
      }
      admin_update_artist: {
        Args: {
          p_accommodation_notes?: string
          p_admin_email: string
          p_artist_id: string
          p_artist_type: string
          p_audius_url?: string
          p_availability_days?: string[]
          p_beatport_url?: string
          p_bio_long?: string
          p_bio_short: string
          p_booking_email: string
          p_booking_whatsapp: string
          p_cities_active?: string[]
          p_city: string
          p_cover_image_url?: string
          p_fee_range?: string
          p_home_city?: string
          p_image_credits?: string
          p_image_rights_authorized?: boolean
          p_instagram: string
          p_internal_notes?: string
          p_presskit_url?: string
          p_priority?: number
          p_profile_image_url: string
          p_pronouns?: string
          p_real_name?: string
          p_responsible_name?: string
          p_responsible_role?: string
          p_set_time_minutes?: number
          p_show_format?: string
          p_slug: string
          p_soundcloud_url?: string
          p_spotify_url?: string
          p_stage_name: string
          p_status?: string
          p_team_size?: number
          p_tech_audio?: string
          p_tech_light?: string
          p_tech_rider_url?: string
          p_tech_stage?: string
          p_website_url?: string
          p_youtube_url?: string
        }
        Returns: {
          accommodation_notes: string
          artist_type: string
          audius_url: string
          availability_days: string[]
          beatport_url: string
          bio_long: string
          bio_short: string
          booking_email: string
          booking_whatsapp: string
          cities_active: string[]
          city: string
          cover_image_url: string
          created_at: string
          fee_range: string
          home_city: string
          id: string
          image_credits: string
          image_rights_authorized: boolean
          instagram: string
          internal_notes: string
          presskit_url: string
          priority: number
          profile_image_url: string
          pronouns: string
          real_name: string
          responsible_name: string
          responsible_role: string
          set_time_minutes: number
          show_format: string
          slug: string
          soundcloud_url: string
          spotify_url: string
          stage_name: string
          status: string
          team_size: number
          tech_audio: string
          tech_light: string
          tech_rider_url: string
          tech_stage: string
          updated_at: string
          website_url: string
          youtube_url: string
        }[]
      }
      admin_update_event: {
        Args:
          | {
              p_city: string
              p_cover_url?: string
              p_description?: string
              p_end_at?: string
              p_event_id: string
              p_organizer_id?: string
              p_slug: string
              p_start_at: string
              p_status?: string
              p_tags?: string[]
              p_title: string
              p_venue_id?: string
            }
          | {
              p_city: string
              p_cover_url?: string
              p_end_at?: string
              p_event_id: string
              p_organizer_id?: string
              p_slug: string
              p_start_at?: string
              p_status?: string
              p_tags?: string[]
              p_title: string
              p_venue_id?: string
            }
        Returns: boolean
      }
      admin_update_highlight_v3: {
        Args: {
          p_admin_email: string
          p_city: string
          p_event_date: string
          p_event_time: string
          p_event_title: string
          p_highlight_id: string
          p_image_url: string
          p_is_published: boolean
          p_photo_credit: string
          p_role_text: string
          p_selection_reasons: string[]
          p_sort_order: number
          p_ticket_price: string
          p_ticket_url: string
          p_venue: string
        }
        Returns: Json
      }
      approve_blog_comment: {
        Args: { p_comment_id: string }
        Returns: undefined
      }
      authenticate_admin_secure: {
        Args: { p_email: string; p_password: string }
        Returns: {
          admin_id: string
          message: string
          session_token: string
          success: boolean
        }[]
      }
      authenticate_admin_simple: {
        Args: { p_email: string; p_password: string }
        Returns: {
          admin_data: Json
          success: boolean
        }[]
      }
      calculate_notification_metrics: {
        Args: {
          p_city?: string
          p_end_date?: string
          p_notification_type?: string
          p_start_date?: string
        }
        Returns: {
          avg_delivery_time_ms: number
          city: string
          click_rate: number
          date: string
          delivery_rate: number
          notification_type: string
          open_rate: number
          total_clicked: number
          total_delivered: number
          total_failed: number
          total_opened: number
          total_sent: number
        }[]
      }
      can_receive_notification: {
        Args: { p_notification_type: string; p_user_id: string }
        Returns: boolean
      }
      change_admin_password: {
        Args: {
          p_admin_id: string
          p_current_password: string
          p_new_password: string
        }
        Returns: undefined
      }
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_is_editor_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      confirm_newsletter_subscription: {
        Args: { p_token: string }
        Returns: boolean
      }
      create_activity: {
        Args:
          | {
              p_actor_id: string
              p_data?: Json
              p_object_id: string
              p_object_type: string
              p_type: string
              p_user_id: string
            }
          | {
              p_actor_id: string
              p_data?: Json
              p_object_id?: string
              p_object_type?: string
              p_type: string
            }
        Returns: undefined
      }
      create_admin_auth_account: {
        Args: { p_email: string; p_password: string }
        Returns: string
      }
      create_admin_session: {
        Args: { p_admin_id: string }
        Returns: string
      }
      create_event_secure: {
        Args: {
          p_city: string
          p_cover_url?: string
          p_description?: string
          p_organizer_id?: string
          p_price_max?: number
          p_price_min?: number
          p_slug: string
          p_start_at: string
          p_tags?: string[]
          p_title: string
          p_venue_id?: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      debug_admin_highlight_auth: {
        Args: { p_admin_email: string; p_highlight_id?: string }
        Returns: Json
      }
      debug_admin_highlights: {
        Args: { p_admin_email: string }
        Returns: Json
      }
      debug_admin_operations: {
        Args: { admin_email: string }
        Returns: Json
      }
      debug_auth_system: {
        Args: { p_user_email?: string }
        Returns: Json
      }
      debug_highlight_workflow: {
        Args: { p_admin_email: string; p_highlight_id?: string }
        Returns: Json
      }
      delete_blog_comment: {
        Args: { p_comment_id: string }
        Returns: undefined
      }
      delete_event_secure: {
        Args: { p_event_id: string }
        Returns: boolean
      }
      ensure_admin_role: {
        Args: { user_email: string }
        Returns: undefined
      }
      generate_category_slug: {
        Args: { category_name: string }
        Returns: string
      }
      generate_confirmation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_email_hash: {
        Args: { email_text: string }
        Returns: string
      }
      generate_event_slug: {
        Args: { p_event_id?: string; p_title: string }
        Returns: string
      }
      generate_venue_slug: {
        Args: { venue_name: string }
        Returns: string
      }
      get_analytics_data: {
        Args: {
          p_city?: string
          p_end_date?: string
          p_event_name?: string
          p_limit?: number
          p_offset?: number
          p_source?: string
          p_start_date?: string
        }
        Returns: {
          city: string
          date: string
          event_count: number
          event_name: string
          source: string
          unique_sessions: number
          unique_users: number
        }[]
      }
      get_analytics_totals: {
        Args: {
          p_city?: string
          p_end_date?: string
          p_source?: string
          p_start_date?: string
        }
        Returns: {
          top_cities: Json
          top_sources: Json
          total_clicks: number
          total_conversions: number
          total_events: number
          total_pageviews: number
          unique_sessions: number
          unique_users: number
        }[]
      }
      get_blog_comments_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean
          post_id: string
          post_title: string
        }[]
      }
      get_blog_comments_admin_hash: {
        Args: Record<PropertyKey, never>
        Returns: {
          author_name: string
          content: string
          created_at: string
          email_hash: string
          id: string
          is_approved: boolean
          post_id: string
          post_title: string
        }[]
      }
      get_blog_comments_safe: {
        Args: { p_post_id: string }
        Returns: {
          author_name: string
          content: string
          created_at: string
          id: string
          parent_id: string
          post_id: string
        }[]
      }
      get_contact_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email_hash: string
          handled: boolean
          handled_by: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }[]
      }
      get_daily_analytics: {
        Args: {
          p_city?: string
          p_end_date?: string
          p_source?: string
          p_start_date?: string
        }
        Returns: {
          clicks: number
          conversions: number
          date: string
          pageviews: number
          unique_users: number
        }[]
      }
      get_highlight_like_count: {
        Args: { p_highlight_id: string }
        Returns: number
      }
      get_nearby_events: {
        Args: { lat: number; lng: number; radius_km?: number }
        Returns: {
          city: string
          date_end: string
          date_start: string
          description: string
          distance_km: number
          id: string
          image_url: string
          price_max: number
          price_min: number
          state: string
          title: string
          venue_address: string
          venue_lat: number
          venue_lng: number
          venue_name: string
        }[]
      }
      get_notification_performance_by_hour: {
        Args: Record<PropertyKey, never>
        Returns: {
          hour_of_day: number
          open_rate: number
          total_opened: number
          total_sent: number
        }[]
      }
      get_organizer_admin_data: {
        Args: { organizer_id: string }
        Returns: {
          contact_email: string
          created_at: string
          id: string
          instagram: string
          name: string
          site: string
          updated_at: string
        }[]
      }
      get_organizer_public_info: {
        Args: { organizer_id: string }
        Returns: {
          created_at: string
          id: string
          instagram: string
          name: string
          site: string
          updated_at: string
        }[]
      }
      get_organizer_public_safe: {
        Args: { p_organizer_id: string }
        Returns: {
          created_at: string
          id: string
          instagram: string
          name: string
          site: string
          updated_at: string
        }[]
      }
      get_partner_admin_data: {
        Args: { partner_id: string }
        Returns: {
          capacity: string
          contact_email: string
          created_at: string
          featured: boolean
          id: string
          image_url: string
          instagram: string
          location: string
          name: string
          rating: number
          types: string[]
          updated_at: string
          website: string
        }[]
      }
      get_performance_summary: {
        Args: { days_back?: number }
        Returns: {
          avg_value: number
          count: number
          metric_name: string
          p75_value: number
          p95_value: number
        }[]
      }
      get_post_likes_count: {
        Args: { p_post_id: string }
        Returns: number
      }
      get_secure_comment_count: {
        Args: { p_post_id: string }
        Returns: number
      }
      get_top_errors: {
        Args: { days_back?: number; limit_count?: number }
        Returns: {
          affected_pages: string[]
          count: number
          error_message: string
          last_occurred: string
        }[]
      }
      get_user_checkin_status: {
        Args: { p_event_id: string; p_user_id: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      hash_email_for_client: {
        Args: { email_input: string }
        Returns: string
      }
      increment_highlight_likes: {
        Args: { highlight_id: string }
        Returns: undefined
      }
      increment_notification_count: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      increment_post_views: {
        Args: { post_id: string }
        Returns: undefined
      }
      insert_contact_message: {
        Args: {
          p_email: string
          p_message: string
          p_name: string
          p_subject: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: { uid?: string }
        Returns: boolean
      }
      is_admin_session: {
        Args: { session_email: string }
        Returns: boolean
      }
      is_admin_session_valid: {
        Args: { p_admin_email: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_via_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_admin: {
        Args: { session_email: string }
        Returns: boolean
      }
      list_notification_cron_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean
          command: string
          jobname: string
          schedule: string
        }[]
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id?: string
          p_table_name?: string
        }
        Returns: undefined
      }
      mark_all_notifications_read: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      mark_contact_message_handled: {
        Args: { p_id: string }
        Returns: undefined
      }
      mark_contact_message_unhandled: {
        Args: { p_id: string }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      reject_blog_comment: {
        Args: { p_comment_id: string }
        Returns: undefined
      }
      reset_daily_notification_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      restore_blog_post_revision: {
        Args: { p_post_id: string; p_revision_id: string }
        Returns: undefined
      }
      search_users_by_username: {
        Args: { search_term: string }
        Returns: {
          avatar_url: string
          display_name: string
          followers_count: number
          is_verified: boolean
          user_id: string
          username: string
        }[]
      }
      secure_admin_access: {
        Args: { admin_email: string }
        Returns: boolean
      }
      setup_notification_cron_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_admin_insert: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      test_basic_operations: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      track_analytics_event: {
        Args: {
          p_city?: string
          p_event_data?: Json
          p_event_name: string
          p_page_url?: string
          p_referrer?: string
          p_session_id?: string
          p_source?: string
        }
        Returns: string
      }
      unsubscribe_newsletter: {
        Args: { p_token: string }
        Returns: boolean
      }
      update_admin_password_secure: {
        Args:
          | { p_admin_id: string; p_new_password: string }
          | { p_new_password: string; p_session_token: string }
        Returns: Json
      }
      update_admin_profile: {
        Args: { p_admin_id: string; p_email: string; p_full_name: string }
        Returns: undefined
      }
      update_blog_post_categories: {
        Args: { p_category_ids: string[]; p_post_id: string }
        Returns: undefined
      }
      update_event_secure: {
        Args: {
          p_cover_url?: string
          p_description?: string
          p_event_id: string
          p_price_max?: number
          p_price_min?: number
          p_start_at?: string
          p_tags?: string[]
          p_title: string
          p_venue_id?: string
        }
        Returns: boolean
      }
      user_liked_highlight: {
        Args: { p_highlight_id: string }
        Returns: boolean
      }
      user_liked_post: {
        Args: { p_post_id: string; p_user_email: string }
        Returns: boolean
      }
      user_liked_post_hash: {
        Args: { p_email_hash: string; p_post_id: string }
        Returns: boolean
      }
      validate_admin_email: {
        Args: { user_email: string }
        Returns: boolean
      }
      validate_admin_file_upload: {
        Args: {
          bucket_name: string
          file_name: string
          file_size: number
          mime_type: string
        }
        Returns: boolean
      }
      validate_admin_session: {
        Args: { p_session_token: string }
        Returns: {
          admin_email: string
          admin_id: string
          admin_name: string
          valid: boolean
        }[]
      }
      validate_role_consistency: {
        Args: Record<PropertyKey, never>
        Returns: {
          in_admin_users: boolean
          in_approved_admins: boolean
          is_consistent: boolean
          profile_is_admin: boolean
          profile_role: Database["public"]["Enums"]["user_role"]
          user_email: string
        }[]
      }
      validate_username: {
        Args: { new_username: string }
        Returns: boolean
      }
      verify_email_hash_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          migration_status: string
          rows_with_hash: number
          table_name: string
          total_rows: number
        }[]
      }
    }
    Enums: {
      article_status: "draft" | "published" | "scheduled"
      badge_type: "activity" | "achievement" | "special" | "milestone"
      category_type:
        | "general"
        | "music"
        | "art"
        | "food"
        | "sports"
        | "technology"
        | "business"
        | "blog"
      city:
        | "porto_alegre"
        | "florianopolis"
        | "curitiba"
        | "sao_paulo"
        | "rio_de_janeiro"
      user_level: "bronze" | "silver" | "gold" | "platinum" | "diamond"
      user_role: "admin" | "editor" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      article_status: ["draft", "published", "scheduled"],
      badge_type: ["activity", "achievement", "special", "milestone"],
      category_type: [
        "general",
        "music",
        "art",
        "food",
        "sports",
        "technology",
        "business",
        "blog",
      ],
      city: [
        "porto_alegre",
        "florianopolis",
        "curitiba",
        "sao_paulo",
        "rio_de_janeiro",
      ],
      user_level: ["bronze", "silver", "gold", "platinum", "diamond"],
      user_role: ["admin", "editor", "moderator"],
    },
  },
} as const
