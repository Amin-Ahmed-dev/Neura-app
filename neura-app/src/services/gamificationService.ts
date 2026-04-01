import { apiClient } from "./apiClient";

export interface Transaction {
  id: string;
  amount: number;
  action_type: string;
  label: string;
  created_at: string;
}

export interface WeekDay {
  date: string;
  neurons: number;
}

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  weekly_neurons: number;
  is_self: boolean;
  is_pro?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  neurons_cost: number;
  partner_logo_url: string | null;
  expiry_date: string | null;
  stock_count: number;
  reward_type: "data" | "promo" | "ticket";
  can_afford: boolean;
}

export const gamificationService = {
  async getBalance() {
    const { data } = await apiClient.get("/gamification/balance");
    return data as { neurons_balance: number; streak_count: number; streak_freeze_count: number };
  },

  async getHistory(page = 1) {
    const { data } = await apiClient.get(`/gamification/history?page=${page}`);
    return data as { transactions: Transaction[]; page: number; total: number; has_more: boolean };
  },

  async getWeeklyChart() {
    const { data } = await apiClient.get("/gamification/weekly-chart");
    return data.days as WeekDay[];
  },

  async getLeaderboard(league: "school" | "city" | "national" = "school") {
    const { data } = await apiClient.get(`/gamification/leaderboard?league=${league}`);
    return data as {
      league: string;
      week_start: string;
      days_until_reset: number;
      entries: LeaderboardEntry[];
      user_rank: LeaderboardEntry | null;
    };
  },

  async listRewards(type?: string) {
    const params = type ? `?reward_type=${type}` : "";
    const { data } = await apiClient.get(`/gamification/rewards${params}`);
    return data as { rewards: RewardItem[]; user_balance: number };
  },

  async redeemReward(rewardId: string) {
    const { data } = await apiClient.post(`/gamification/rewards/${rewardId}/redeem`);
    return data as { reward_code: string; reward_title: string; neurons_spent: number; new_balance: number };
  },
};
