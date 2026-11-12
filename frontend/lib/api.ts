// frontend/lib/api.ts

// ============================================================
// 🔥 API CLIENT - FastAPI Backend
// ============================================================

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================
// 📊 TYPES
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  church_name?: string;
  church_location?: string;
  is_active: boolean;
  // ✅ Approval fields
  is_approved?: boolean;
  approval_status?: string;
  approved_by_name?: string;
  approved_at?: string;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Offering {
  id: string;
  service_date: string;
  service_type: string;
  offering_type: string;
  amount: number;
  description?: string;
  status: string;
  team_name?: string;
  team_members?: string[];
  team_leader?: string;
  number_of_members?: number;
  total_expenses?: number;
  balance?: number;
  bank_reference?: string;
  deposited_at?: string;
  recorded_by?: string;
  recorded_by_name?: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfferingCreatePayload {
  service_date: string;
  service_type: string;
  offering_type: string;
  amount: number;
  description?: string;
  team_name: string;
  team_members: string[];
  team_leader: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  offering_id: string;
  receipt_number?: string;
  receipt_image?: string;
  status: string;
  requested_by?: string;
  requested_by_name?: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  withdrawn_by?: string;
  withdrawn_by_name?: string;
  withdrawal_reference?: string;
  withdrawn_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCreatePayload {
  description: string;
  category: string;
  amount: number;
  offering_id: string;
  receipt_number?: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  description?: string;
  content?: string;
  scripture?: string;
  audio_url?: string;
  video_url?: string;
  pdf_url?: string;
  thumbnail_url?: string;
  duration?: number;
  views?: number;
  downloads?: number;
  likes?: number;
  status?: string;
  created_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  category?: string;
  date: string;
  start_date?: string;
  end_date?: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  venue?: string;
  is_online?: boolean;
  meeting_link?: string;
  organizer?: string;
  organizer_contact?: string;
  organizer_email?: string;
  max_attendees?: number;
  current_attendees?: number;
  image_url?: string;
  video_url?: string;
  audio_url?: string;
  pdf_url?: string;
  status?: string;
  created_at?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  image_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  size?: number;
  tags?: string;
  views?: number;
  downloads?: number;
  is_featured?: boolean;
  is_published?: boolean;
  event_id?: string;
  created_by?: string;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryCreatePayload {
  title: string;
  description?: string;
  category?: string;
  image_url: string;
  thumbnail_url?: string;
  tags?: string;
  is_featured?: boolean;
  is_published?: boolean;
  event_id?: string;
}

export interface DashboardStats {
  total_offerings: number;
  total_expenses: number;
  balance: number;
  week_offerings: number;
  month_offerings: number;
  currency: string;
  total_members: number;
  total_events: number;
  total_sermons: number;
  recent_offerings: Array<{
    id: string;
    date: string | null;
    service: string;
    offering_type?: string;
    amount: number;
    status: string;
    recorded_by?: string;
    description?: string;
  }>;
  recent_expenses: Array<{
    id: string;
    date: string | null;
    category: string;
    description: string;
    amount: number;
    status: string;
  }>;
}

export interface PublicStats {
  total_members: number;
  total_events: number;
  total_sermons: number;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// ============================================================
// 👣 VISITOR TYPES
// ============================================================

export interface VisitorStats {
  total_visitors: number;
  total_views: number;
  unique_visitors_today: number;
  unique_visitors_week: number;
  unique_visitors_month: number;
  total_members: number;
}

export interface TrackVisitResponse {
  success: boolean;
  session_id: string;
  is_unique: boolean;
}

// ============================================================
// 🔐 TOKEN MANAGEMENT
// ============================================================

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },
  set: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  },
  remove: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
  },
};

export const userStorage = {
  get: (): User | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  set: (user: User) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("user_name", user.name);
    localStorage.setItem("user_type", user.role);
    localStorage.setItem("user_id", user.id);
    localStorage.setItem("user_email", user.email);
  },
  remove: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_type");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
  },
};

// ============================================================
// ❌ API ERROR
// ============================================================

export class ApiError extends Error {
  status: number;
  details: any;
  constructor(message: string, status: number, details: any = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = "ApiError";
  }
}

// ============================================================
// 🔄 CORE FETCH
// ============================================================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const hadToken = !!token;
      tokenStorage.remove();
      userStorage.remove();

      if (hadToken && typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiError("Not authenticated", 401);
    }

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status}`;
      let errorDetails: any = null;

      try {
        const errorData = await response.json();
        errorDetails = errorData;

        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((e: any) => {
              const field = Array.isArray(e.loc)
                ? e.loc.filter((x: any) => x !== "body").join(".")
                : "";
              return field ? `${field}: ${e.msg}` : e.msg;
            })
            .join(" | ");
        } else if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (typeof errorData.error === "string") {
          errorMessage = errorData.error;
        }

        console.error("🔴 API ERROR:", {
          status: response.status,
          url,
          details: errorData,
        });
      } catch {
        // response sio JSON
      }

      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new ApiError(
        "Cannot connect to server. Please check your internet connection.",
        0
      );
    }
    throw new ApiError(error.message || "Network error", 0);
  }
}

// ============================================================
// 🔐 AUTH API
// ============================================================

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const data = await apiFetch<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    tokenStorage.set(data.access_token);
    userStorage.set(data.user);
    return data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    church_name?: string;
    church_location?: string;
  }): Promise<User> => {
    return apiFetch<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout: () => {
    tokenStorage.remove();
    userStorage.remove();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  },

  me: async (): Promise<User> => {
    return apiFetch<User>("/api/v1/auth/me");
  },

  refresh: async (refresh_token: string): Promise<{ access_token: string }> => {
    return apiFetch<{ access_token: string }>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    });
  },
};

// ============================================================
// 💰 OFFERINGS API
// ============================================================

export const offeringsApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<Offering[]> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    const qs = query.toString();
    return apiFetch<Offering[]>(`/api/v1/offerings/${qs ? `?${qs}` : ""}`);
  },

  get: async (id: string): Promise<Offering> => {
    return apiFetch<Offering>(`/api/v1/offerings/${id}`);
  },

  create: async (payload: OfferingCreatePayload): Promise<Offering> => {
    return apiFetch<Offering>("/api/v1/offerings/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  approve: async (
    id: string,
    payload: {
      status?: string;
      bank_reference?: string;
      deposited_at?: string;
    }
  ): Promise<Offering> => {
    return apiFetch<Offering>(`/api/v1/offerings/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: Partial<Offering>): Promise<Offering> => {
    return apiFetch<Offering>(`/api/v1/offerings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/v1/offerings/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================
// 💸 EXPENSES API
// ============================================================

export const expensesApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<Expense[]> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    const qs = query.toString();
    return apiFetch<Expense[]>(`/api/v1/expenses/${qs ? `?${qs}` : ""}`);
  },

  get: async (id: string): Promise<Expense> => {
    return apiFetch<Expense>(`/api/v1/expenses/${id}`);
  },

  create: async (payload: ExpenseCreatePayload): Promise<Expense> => {
    return apiFetch<Expense>("/api/v1/expenses/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  approve: async (id: string): Promise<Expense> => {
    return apiFetch<Expense>(`/api/v1/expenses/${id}/approve`, {
      method: "PUT",
    });
  },

  withdraw: async (
    id: string,
    payload: { withdrawal_reference?: string }
  ): Promise<Expense> => {
    return apiFetch<Expense>(`/api/v1/expenses/${id}/withdraw`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: Partial<Expense>): Promise<Expense> => {
    return apiFetch<Expense>(`/api/v1/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/v1/expenses/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================
// 📖 SERMONS API
// ============================================================

export const sermonsApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<Sermon[]> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiFetch<Sermon[]>(`/api/v1/sermons/${qs ? `?${qs}` : ""}`);
  },

  get: async (id: string): Promise<Sermon> => {
    return apiFetch<Sermon>(`/api/v1/sermons/${id}`);
  },

  create: async (payload: Partial<Sermon>): Promise<Sermon> => {
    return apiFetch<Sermon>("/api/v1/sermons/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: Partial<Sermon>): Promise<Sermon> => {
    return apiFetch<Sermon>(`/api/v1/sermons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/v1/sermons/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================
// 📖 SERMON ACTIONS
// ============================================================

export const sermonActionsApi = {
  incrementView: async (id: string): Promise<{ views: number }> => {
    return apiFetch<{ views: number }>(`/api/v1/sermons/${id}/view`, {
      method: "POST",
    });
  },

  incrementDownload: async (id: string): Promise<{ downloads: number }> => {
    return apiFetch<{ downloads: number }>(`/api/v1/sermons/${id}/download`, {
      method: "POST",
    });
  },

  like: async (id: string): Promise<{ likes: number }> => {
    return apiFetch<{ likes: number }>(`/api/v1/sermons/${id}/like`, {
      method: "POST",
    });
  },
};

// ============================================================
// 📅 EVENTS API
// ============================================================

export const eventsApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<Event[]> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiFetch<Event[]>(`/api/v1/events/${qs ? `?${qs}` : ""}`);
  },

  get: async (id: string): Promise<Event> => {
    return apiFetch<Event>(`/api/v1/events/${id}`);
  },

  create: async (payload: Partial<Event>): Promise<Event> => {
    return apiFetch<Event>("/api/v1/events/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: Partial<Event>): Promise<Event> => {
    return apiFetch<Event>(`/api/v1/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/v1/events/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================
// 🖼️ GALLERY API
// ============================================================

export const galleryApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    category?: string;
  }): Promise<GalleryItem[]> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.category) query.set("category", params.category);
    const qs = query.toString();
    return apiFetch<GalleryItem[]>(`/api/v1/gallery/${qs ? `?${qs}` : ""}`);
  },

  public: async (params?: {
    limit?: number;
    category?: string;
  }): Promise<GalleryItem[]> => {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.category) query.set("category", params.category);
    const qs = query.toString();
    return apiFetch<GalleryItem[]>(`/api/v1/gallery/public${qs ? `?${qs}` : ""}`);
  },

  get: async (id: string): Promise<GalleryItem> => {
    return apiFetch<GalleryItem>(`/api/v1/gallery/${id}`);
  },

  create: async (payload: GalleryCreatePayload): Promise<GalleryItem> => {
    return apiFetch<GalleryItem>("/api/v1/gallery/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: Partial<GalleryItem>): Promise<GalleryItem> => {
    return apiFetch<GalleryItem>(`/api/v1/gallery/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/v1/gallery/${id}`, {
      method: "DELETE",
    });
  },

  incrementView: async (id: string): Promise<{ views: number }> => {
    return apiFetch<{ views: number }>(`/api/v1/gallery/${id}/view`, {
      method: "POST",
    });
  },
};

// ============================================================
// 📤 UPLOAD API
// ============================================================

export const uploadApi = {
  upload: async (
    file: File,
    type: "audio" | "video" | "image" | "pdf"
  ): Promise<UploadResult> => {
    const token = tokenStorage.get();
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE}/api/v1/upload/${type}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (res.status === 401) {
        tokenStorage.remove();
        userStorage.remove();
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        throw new ApiError("Not authenticated", 401);
      }

      if (!res.ok) {
        let errorMessage = `Upload failed: ${res.status}`;
        let errorDetails: any = null;
        try {
          const data = await res.json();
          errorDetails = data;
          if (typeof data.detail === "string") {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail
              .map((e: any) => e.msg || String(e))
              .join(" | ");
          }
        } catch {}
        throw new ApiError(errorMessage, res.status, errorDetails);
      }

      return (await res.json()) as UploadResult;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new ApiError(
          "Cannot connect to server. Please check your internet connection.",
          0
        );
      }
      throw new ApiError(error.message || "Upload error", 0);
    }
  },

  audio: (file: File) => uploadApi.upload(file, "audio"),
  video: (file: File) => uploadApi.upload(file, "video"),
  image: (file: File) => uploadApi.upload(file, "image"),
  pdf: (file: File) => uploadApi.upload(file, "pdf"),
};

// ============================================================
// 📊 REPORTS API
// ============================================================

export const reportsApi = {
  dashboard: async (): Promise<DashboardStats> => {
    return apiFetch<DashboardStats>("/api/v1/reports/dashboard");
  },

  offeringsSummary: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    const qs = query.toString();
    return apiFetch<any>(
      `/api/v1/reports/offerings-summary${qs ? `?${qs}` : ""}`
    );
  },

  expensesSummary: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    const qs = query.toString();
    return apiFetch<any>(
      `/api/v1/reports/expenses-summary${qs ? `?${qs}` : ""}`
    );
  },
};

// ============================================================
// 👥 USERS API
// ============================================================

export const usersApi = {
  list: async (params?: { skip?: number; limit?: number }): Promise<User[]> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiFetch<User[]>(`/api/v1/users/${qs ? `?${qs}` : ""}`);
  },

  get: async (id: string): Promise<User> => {
    return apiFetch<User>(`/api/v1/users/${id}`);
  },

  create: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    church_name?: string;
    church_location?: string;
  }): Promise<User> => {
    return apiFetch<User>("/api/v1/users/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: Partial<User> & { password?: string }): Promise<User> => {
    return apiFetch<User>(`/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/v1/users/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================
// ✅ REGISTRATIONS API (kwa viongozi kuidhinisha/kukataa)
// ============================================================

export const registrationsApi = {
  /**
   * Orodha ya maombi yanayosubiri idhini
   * (Viongozi pekee: mchungaji_kiongozi, msaidizi, mwinjilist, super_admin)
   */
  list: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<User[]> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiFetch<User[]>(`/api/v1/registrations/${qs ? `?${qs}` : ""}`);
  },

  /**
   * Pata usajili mmoja
   */
  get: async (id: string): Promise<User> => {
    return apiFetch<User>(`/api/v1/registrations/${id}`);
  },

  /**
   * Idhinisha usajili
   */
  approve: async (id: string): Promise<User> => {
    return apiFetch<User>(`/api/v1/registrations/approve/${id}`, {
      method: "POST",
    });
  },

  /**
   * Kataa usajili — atafutwa moja kwa moja kwenye database
   */
  reject: async (
    id: string,
    rejection_reason?: string
  ): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/v1/registrations/reject/${id}`, {
      method: "POST",
      body: JSON.stringify({ rejection_reason }),
    });
  },

  /**
   * Takwimu za usajili
   */
  stats: async (): Promise<any> => {
    return apiFetch<any>("/api/v1/registrations/stats/summary");
  },
};

// ============================================================
// 👣 VISITORS API
// ============================================================

export const visitorsApi = {
  /**
   * Rekodi tembeleo la mtumiaji
   * - Public (bila auth)
   * - Inatumika kwenye kila ukurasa wa public
   */
  track: async (payload: {
    page: string;
    path: string;
    referrer?: string;
  }): Promise<TrackVisitResponse> => {
    return apiFetch<TrackVisitResponse>("/api/v1/visitors/track", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Takwimu za umma (bila auth)
   */
  stats: async (): Promise<VisitorStats> => {
    return apiFetch<VisitorStats>("/api/v1/visitors/stats");
  },

  /**
   * Takwimu za admin (auth) — kwa viongozi
   */
  adminStats: async (): Promise<any> => {
    return apiFetch<any>("/api/v1/visitors/stats/admin");
  },
};

// ============================================================
// 📩 MESSAGES API
// ============================================================

export const messagesApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    category?: string;
  }): Promise<any[]> => {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.category) query.set("category", params.category);
    const qs = query.toString();
    return apiFetch<any[]>(`/api/v1/messages/${qs ? `?${qs}` : ""}`);
  },

  get: async (id: string): Promise<any> => {
    return apiFetch<any>(`/api/v1/messages/${id}`);
  },

  create: async (payload: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    category?: string;
    message: string;
  }): Promise<any> => {
    return apiFetch<any>("/api/v1/messages/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: {
    status?: string;
    category?: string;
    reply_text?: string;
    is_archived?: boolean;
  }): Promise<any> => {
    return apiFetch<any>(`/api/v1/messages/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/v1/messages/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================================
// ⚙️ SETTINGS API
// ============================================================

export const settingsApi = {
  getGrouped: async (): Promise<Record<string, Record<string, string>>> => {
    return apiFetch<Record<string, Record<string, string>>>(
      "/api/v1/settings/grouped"
    );
  },

  list: async (): Promise<any[]> => {
    return apiFetch<any[]>("/api/v1/settings/");
  },

  getPublic: async (): Promise<Record<string, string>> => {
    return apiFetch<Record<string, string>>("/api/v1/settings/public");
  },

  updateBulk: async (values: Record<string, string>): Promise<{ updated: number }> => {
    return apiFetch<{ updated: number }>("/api/v1/settings/", {
      method: "PUT",
      body: JSON.stringify({ values }),
    });
  },

  update: async (
    key: string,
    value: string,
    description?: string,
    category?: string
  ): Promise<any> => {
    return apiFetch<any>(`/api/v1/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value, description, category }),
    });
  },

  get: async (key: string): Promise<any> => {
    return apiFetch<any>(`/api/v1/settings/${key}`);
  },
};

// ============================================================
// 🌍 PUBLIC API
// ============================================================

export const publicApi = {
  events: async (limit = 3): Promise<Event[]> => {
    return apiFetch<Event[]>(`/api/v1/events/public?limit=${limit}`);
  },

  sermons: async (limit = 3): Promise<Sermon[]> => {
    return apiFetch<Sermon[]>(`/api/v1/sermons/public?limit=${limit}`);
  },

  sermon: async (id: string): Promise<Sermon> => {
    return apiFetch<Sermon>(`/api/v1/sermons/public/${id}`);
  },

  gallery: async (limit = 50): Promise<GalleryItem[]> => {
    return apiFetch<GalleryItem[]>(`/api/v1/gallery/public?limit=${limit}`);
  },

  stats: async (): Promise<PublicStats> => {
    return apiFetch<PublicStats>(`/api/v1/reports/public-stats`);
  },

  leaders: async (limit = 10): Promise<User[]> => {
    return apiFetch<User[]>(`/api/v1/users/public/leaders?limit=${limit}`);
  },
};

// ============================================================
// 🎯 EXPORT DEFAULT
// ============================================================

export default {
  auth: authApi,
  offerings: offeringsApi,
  expenses: expensesApi,
  sermons: sermonsApi,
  sermonActions: sermonActionsApi,
  events: eventsApi,
  gallery: galleryApi,
  upload: uploadApi,
  reports: reportsApi,
  users: usersApi,
  registrations: registrationsApi,
  visitors: visitorsApi, // ✅ Mpya
  messages: messagesApi,
  settings: settingsApi,
  public: publicApi,
  tokenStorage,
  userStorage,
  ApiError,
};