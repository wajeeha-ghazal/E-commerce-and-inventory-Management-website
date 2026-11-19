import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { fetchAdminUsers, updateAdminUserRole, fetchAdminStats } from '../../adminSlice';
import AdminPagination from '../AdminPagination';
import type { UserRole, UserDTO } from '@ecomm/shared';

export const UsersTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { users, usersLoading } = useAppSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  // Pagination calculations
  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return users.slice(start, start + limit);
  }, [users, page, limit]);

  const handleToggleUserRole = async (targetUser: UserDTO) => {
    const newRole: UserRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    if (
      window.confirm(
        `Change role of "${targetUser.email}" from "${targetUser.role}" to "${newRole}"?`
      )
    ) {
      await dispatch(updateAdminUserRole({ id: targetUser.id, role: newRole }));
      dispatch(fetchAdminStats());
    }
  };

  return (
    <>
      <Card className="border-warm shadow-sm rounded-3 bg-white mb-4">
        <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4">
          <h5 className="serif-display text-dark mb-0">Registered User Accounts &amp; Roles</h5>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-cream small text-muted text-uppercase">
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="text-end pe-4">Role Action</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No users registered.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u: UserDTO) => (
                    <tr key={u.id}>
                      <td className="text-muted small">#{u.id}</td>
                      <td className="fw-medium text-dark">{u.email}</td>
                      <td className="small text-muted">{u.profile?.fullName || '—'}</td>
                      <td className="small text-muted">{u.profile?.phone || '—'}</td>
                      <td>
                        <Badge
                          bg={u.role === 'super_admin' ? 'dark' : u.role === 'admin' ? 'primary' : 'cream'}
                          className={u.role === 'customer' ? 'text-dark border' : 'text-white'}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="small text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-end pe-4 text-nowrap">
                        {u.id === currentUser?.id ? (
                          <Badge bg="secondary" className="px-2 py-1">
                            You (Current Account)
                          </Badge>
                        ) : u.role === 'super_admin' ? (
                          <Badge bg="dark" className="px-2 py-1">
                            Super Admin
                          </Badge>
                        ) : u.role === 'admin' ? (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="py-1 px-2"
                            onClick={() => handleToggleUserRole(u)}
                          >
                            Demote to Customer
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline-dark"
                            className="py-1 px-2 border-warm"
                            onClick={() => handleToggleUserRole(u)}
                          >
                            Make Admin
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
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
    </>
  );
};

export default UsersTab;
