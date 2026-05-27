import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, Edit } from 'lucide-react';

const API_URL = '/api';

export default function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${API_URL}/orders`);
                setOrders(res.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return 'badge-approved';
            case 'REJECTED': return 'badge-rejected';
            case 'PENDING_APPROVAL': return 'badge-pending';
            default: return 'badge-pending';
        }
    };

    if (loading) return <div className="animate-fade-in">Loading orders...</div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h2 className="page-title">Orders</h2>
                <Link to="/create-order" className="btn btn-primary">Create New Order</Link>
            </div>

            <div className="card table-container">
                {orders.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders found. Create one to get started.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Order Number</th>
                                <th>Date</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Approval Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{order.orderNumber}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>${order.finalAmount?.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>{order.approvalType || '-'}</td>
                                    <td style={{ display: 'flex', gap: '6px' }}>
                                        <Link to={`/orders/${order.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                            <Eye size={14} /> View
                                        </Link>
                                        {order.status === 'APPROVED' && (
                                            <Link to={`/orders/${order.id}/pay`} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#16a34a', borderColor: '#16a34a' }}>
                                                💳 Pay
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
