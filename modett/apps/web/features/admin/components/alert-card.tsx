import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  ShoppingBag,
  AlertTriangle,
  Package,
} from "lucide-react";

interface StockAlertItem {
  variantId: string;
  productTitle: string;
  sku: string;
  onHand: number;
  threshold: number;
}

interface AlertCardProps {
  pendingOrders: number;
  lowStockItems: StockAlertItem[];
}

export function AlertCard({ pendingOrders, lowStockItems }: AlertCardProps) {
  return (
    <Card className="border-[#BBA496]/30">
      <CardHeader className="border-b border-[#BBA496]/20 bg-white">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-lg font-medium text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Alerts & Notifications
          </CardTitle>
          {pendingOrders > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 font-medium"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              {pendingOrders} Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Pending Orders Alert */}
          {pendingOrders > 0 ? (
            <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className="text-sm font-semibold text-amber-900 mb-1"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {pendingOrders} Orders Awaiting Processing
                </h4>
                <p
                  className="text-xs text-amber-700 mb-3"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  These orders need your attention to avoid shipping delays
                </p>
                <button
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  View Orders →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-green-700" />
              </div>
              <div className="flex-1">
                <h4
                  className="text-sm font-semibold text-green-900 mb-1"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  All Caught Up!
                </h4>
                <p
                  className="text-xs text-green-700"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  No pending orders at the moment
                </p>
              </div>
            </div>
          )}

          {/* Low Stock Alerts Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-[#8B7355]" />
              <h3
                className="text-sm font-semibold text-[#232D35] uppercase tracking-wider"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Low Stock Alerts
              </h3>
              {lowStockItems.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 text-xs"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {lowStockItems.length}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between p-3 bg-[#F8F5F2] hover:bg-[#F5F5F0] border border-[#BBA496]/30 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium text-[#232D35] truncate"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          {item.productTitle}
                        </p>
                        <p
                          className="text-xs text-[#8B7355] mt-0.5"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          SKU: {item.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p
                        className="text-sm font-bold text-red-600"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        {item.onHand} left
                      </p>
                      <p
                        className="text-xs text-[#9CA3AF]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Min: {item.threshold}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-[#BBA496] mx-auto mb-3" />
                  <p
                    className="text-sm text-[#8B7355]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    All products are well stocked
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
