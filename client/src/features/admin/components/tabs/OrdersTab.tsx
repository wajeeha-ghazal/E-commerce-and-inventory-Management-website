import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Form, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { fetchAdminOrders, updateAdminOrderStatus, fetchAdminStats } from '../../adminSlice';
import OrderDetailsModal from '../modals/OrderDetailsModal';
import AdminPagination from '../AdminPagination';
import type { OrderDTO, OrderStatus } from '@ecomm/shared';
import { ORDER_STATUSES } from '@ecomm/shared/src/constants';

export const OrdersTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, ordersLoading } = useAppSelector((state) => state.admin);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewingOrder, setViewingOrder] = useState<OrderDTO | null>(null);

  useEffect(() => {
    dispatch(fetchAdminOrders(statusFilter === 'all' ? undefined : statusFilter));
  }, [dispatch, statusFilter]);

  // Pagination calculations
  const totalItems = orders.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return orders.slice(start, start + limit);
  }, [orders, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    await dispatch(updateAdminOrderStatus({ id: orderId, status }));
    dispatch(fetchAdminStats());
  };

  return (
    <>
      <Card className="border-warm shadow-sm rounded-3 bg-white mb-4">
        <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div className="d-flex align-items-center gap-1 flex-wrap">
            <span className="small text-muted me-2">Status:</span>
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'dark' : 'outline-secondary'}
              className="rounded-pill px-3 py-1 border-warm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            {ORDER_STATUSES.map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'dark' : 'outline-secondary'}
                className="rounded-pill px-3 py-1 text-capitalize border-warm"
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </Button>
            ))}
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-cream small text-muted text-uppercase">
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Fulfillment Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading orders...
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No orders found with status "{statusFilter}".
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o) => {
                    const itemCount =
                      o.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0;
                    return (
                      <tr key={o.id}>
                        <td className="fw-semibold text-dark">#{o.id}</td>
                        <td>
                          <div className="small fw-medium text-dark">{o.user?.email}</div>
                          <div className="text-muted small">
                            {o.shippingAddress || 'No address provided'}
                          </div>
                        </td>
                        <td className="small text-muted text-nowrap">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <span className="badge bg-cream text-dark border border-warm">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </td>
                        <td className="fw-semibold text-terracotta text-nowrap">
                          ${Number(o.total).toFixed(2)}
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={o.status}
                            onChange={(e) =>
                              handleStatusChange(o.id, e.target.value as OrderStatus)
                            }
                            className="border-warm small py-1 px-2 text-capitalize fw-medium"
                            style={{ width: '135px' }}
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st.charAt(0).toUpperCase() + st.slice(1)}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td className="text-end pe-4">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="py-1 px-2 border-warm"
                            onClick={() => setViewingOrder(o)}
                            title="View order items"
                          >
                            <i className="bi bi-eye me-1" /> View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </Card>

      <OrderDetailsModal order={viewingOrder} onHide={() => setViewingOrder(null)} />
    </>
  );
};

export default OrdersTab;
