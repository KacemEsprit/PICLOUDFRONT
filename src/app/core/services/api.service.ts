import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, AuthResponse, User,
  PricingPlan, SubscriptionRequest, SubscriptionResponse,
  Reduction, LoyaltyAccountResponse, RedeemRequest, PointTransaction,
  PaymentInitRequest, PaymentInitResponse,
  PlanRecommendationResponse, ChurnPredictionResponse, CLVResponse, ActionSendResponse,
  TransportType, PricingType, LoyaltyTier, RoleEnum
} from '../models/models';

interface BackendAuthPayload {
  token: string; id: number; username: string;
  email: string; name: string; role: string; transportType?: string;
}
interface SpringPage<T> { content?: T[]; }
interface AdminUserPayload {
  id: number; username: string; email: string; name: string; role: string;
  cin?: number | null; enabled?: boolean; isEnabled?: boolean;
  createdAt?: string; updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');
  constructor(private http: HttpClient) {}

  private mapAdminUserToUser(u: AdminUserPayload): User {
    return { id: u.id, username: u.username, email: u.email, name: u.name,
             role: u.role as RoleEnum, isEnabled: u.enabled ?? u.isEnabled ?? true,
             createdAt: u.createdAt };
  }

  // ===== AUTH =====
  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<BackendAuthPayload>(`${this.base}/api/auth/login`, req).pipe(
      map((res) => ({
        token: res.token,
        user: {
          id: res.id, username: res.username, email: res.email,
          name: res.name, role: res.role as RoleEnum, isEnabled: true,
          ...(res.transportType != null && String(res.transportType).trim() !== ''
            ? { transportType: String(res.transportType).toUpperCase() as TransportType }
            : {}),
        },
      }))
    );
  }

  // ===== USERS =====
  getAllUsers(): Observable<User[]> {
    const params = new HttpParams().set('size', '500').set('page', '0');
    return this.http.get<SpringPage<AdminUserPayload>>(`${this.base}/api/admin/users`, { params }).pipe(
      map((page) => (page.content ?? []).map((u) => this.mapAdminUserToUser(u)))
    );
  }
  getUserById(id: number): Observable<User> {
    return this.http.get<AdminUserPayload>(`${this.base}/api/admin/users/${id}`)
      .pipe(map((u) => this.mapAdminUserToUser(u)));
  }
  setTransportType(userId: number, transportType: TransportType): Observable<unknown> {
    return this.http.get<AdminUserPayload>(`${this.base}/api/admin/users/${userId}`).pipe(
      switchMap((u) => {
        const body = { username: u.username, email: u.email, name: u.name,
                       role: u.role as RoleEnum, ...(u.cin != null ? { cin: u.cin } : {}),
                       enabled: u.enabled ?? u.isEnabled ?? true, transportType };
        return this.http.put(`${this.base}/api/admin/users/${userId}`, body);
      })
    );
  }

  // ===== PRICING PLANS =====
  getAllPlans(): Observable<PricingPlan[]> {
    return this.http.get<PricingPlan[]>(`${this.base}/pricing-plans`);
  }
  getPlansByOperator(operatorId: number): Observable<PricingPlan[]> {
    return this.http.get<PricingPlan[]>(`${this.base}/pricing-plans/operator/${operatorId}`);
  }
  getPlanById(id: number): Observable<PricingPlan> {
    return this.http.get<PricingPlan>(`${this.base}/pricing-plans/${id}`);
  }
  createPlan(plan: PricingPlan, operatorId: number): Observable<PricingPlan> {
    return this.http.post<PricingPlan>(`${this.base}/pricing-plans/operator/${operatorId}`, plan);
  }
  updatePlan(id: number, plan: PricingPlan, operatorId: number): Observable<PricingPlan> {
    return this.http.put<PricingPlan>(`${this.base}/pricing-plans/${id}/operator/${operatorId}`, plan);
  }
  deletePlan(id: number, operatorId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/pricing-plans/${id}/operator/${operatorId}`);
  }
  getPlansByTransport(transportType: TransportType): Observable<PricingPlan[]> {
    return this.http.get<PricingPlan[]>(`${this.base}/pricing-plans/by-transport/${transportType}`);
  }
  getPlansByType(type: PricingType): Observable<PricingPlan[]> {
    return this.http.get<PricingPlan[]>(`${this.base}/pricing-plans/by-type/${type}`);
  }

  // ===== SUBSCRIPTIONS =====
  subscribe(req: SubscriptionRequest, passengerId: number): Observable<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(`${this.base}/subscriptions/passenger/${passengerId}`, req);
  }
  getMySubscriptions(passengerId: number): Observable<SubscriptionResponse[]> {
    return this.http.get<SubscriptionResponse[]>(`${this.base}/subscriptions/passenger/${passengerId}`);
  }
  getAllSubscriptions(): Observable<SubscriptionResponse[]> {
    return this.http.get<SubscriptionResponse[]>(`${this.base}/subscriptions`);
  }
  getSubscriptionsByOperator(operatorId: number): Observable<SubscriptionResponse[]> {
    return this.http.get<SubscriptionResponse[]>(`${this.base}/subscriptions/operator/${operatorId}`);
  }
  cancelSubscription(id: number, passengerId: number): Observable<SubscriptionResponse> {
    return this.http.put<SubscriptionResponse>(
      `${this.base}/subscriptions/${id}/cancel/passenger/${passengerId}`, {});
  }

  // ===== REDUCTIONS =====
  getAllReductions(): Observable<Reduction[]> {
    return this.http.get<Reduction[]>(`${this.base}/reductions`);
  }
  getReductionsByOperator(operatorId: number): Observable<Reduction[]> {
    return this.http.get<Reduction[]>(`${this.base}/reductions/operator/${operatorId}`);
  }
  getValidReductions(): Observable<Reduction[]> {
    return this.http.get<Reduction[]>(`${this.base}/reductions/valides`);
  }
  getReductionByCode(code: string): Observable<Reduction> {
    return this.http.get<Reduction>(`${this.base}/reductions/code/${code}`);
  }
  getAccessibleReductions(points: number): Observable<Reduction[]> {
    return this.http.get<Reduction[]>(`${this.base}/reductions/accessibles/${points}`);
  }
  createReduction(r: Reduction, operatorId: number): Observable<Reduction> {
    return this.http.post<Reduction>(`${this.base}/reductions/operator/${operatorId}`, r);
  }
  updateReduction(id: number, r: Reduction): Observable<Reduction> {
    return this.http.put<Reduction>(`${this.base}/reductions/${id}`, r);
  }
  deleteReduction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/reductions/${id}`);
  }

  // ===== LOYALTY =====
  getMyLoyalty(passengerId: number): Observable<LoyaltyAccountResponse> {
    return this.http.get<LoyaltyAccountResponse>(
      `${this.base}/loyalty-accounts/passenger/${passengerId}`);
  }
  getAllLoyalty(): Observable<LoyaltyAccountResponse[]> {
    return this.http.get<LoyaltyAccountResponse[]>(`${this.base}/loyalty-accounts`);
  }
  getLoyaltyByTier(tier: LoyaltyTier): Observable<LoyaltyAccountResponse[]> {
    return this.http.get<LoyaltyAccountResponse[]>(`${this.base}/loyalty-accounts/by-tier/${tier}`);
  }
  redeemPoints(passengerId: number, req: RedeemRequest): Observable<LoyaltyAccountResponse> {
    return this.http.post<LoyaltyAccountResponse>(
      `${this.base}/loyalty-accounts/redeem/passenger/${passengerId}`, req);
  }
  getTransactions(accountId: number): Observable<PointTransaction[]> {
    return this.http.get<PointTransaction[]>(
      `${this.base}/point-transactions/account/${accountId}`);
  }

  // ===== PAYMENT =====
  initiatePayment(req: PaymentInitRequest): Observable<PaymentInitResponse> {
    return this.http.post<PaymentInitResponse>(`${this.base}/payment/initiate`, req);
  }
  initiatePaymentMe(
    pricingPlanId: number, codeReduction?: string, autoRenewal?: boolean,
    paymentMode: 'CASH' | 'POINTS' = 'CASH', pointsToUse?: number,
  ): Observable<PaymentInitResponse> {
    return this.http.post<PaymentInitResponse>(`${this.base}/payment/initiate/me`, {
      pricingPlanId, codeReduction, autoRenewal: autoRenewal === true, paymentMode,
      ...(pointsToUse != null ? { pointsToUse } : {}),
    });
  }
  updateSubscriptionAutoRenewal(
    subscriptionId: number, passengerId: number, autoRenewal: boolean,
  ): Observable<SubscriptionResponse> {
    return this.http.put<SubscriptionResponse>(
      `${this.base}/subscriptions/${subscriptionId}/auto-renewal/passenger/${passengerId}`,
      { autoRenewal });
  }
  confirmPayment(sessionId: string): Observable<SubscriptionResponse> {
    return this.http.get<SubscriptionResponse>(
      `${this.base}/payment/success?session_id=${sessionId}`);
  }

  // ===== ML =====
  recommendPlan(passengerId: number): Observable<PlanRecommendationResponse> {
    return this.http.get<PlanRecommendationResponse>(`${this.base}/ml/recommend/${passengerId}`);
  }
  predictChurn(passengerId: number): Observable<ChurnPredictionResponse> {
    return this.http.get<ChurnPredictionResponse>(`${this.base}/ml/churn/${passengerId}`);
  }
  predictChurnAll(): Observable<ChurnPredictionResponse[]> {
    return this.http.get<ChurnPredictionResponse[]>(`${this.base}/ml/churn/all`);
  }
  predictCLV(passengerId: number): Observable<CLVResponse> {
    return this.http.get<CLVResponse>(`${this.base}/ml/clv/${passengerId}`);
  }
  sendAction(passengerId: number): Observable<ActionSendResponse> {
    return this.http.post<ActionSendResponse>(`${this.base}/ml/action/send/${passengerId}`, {});
  }
}