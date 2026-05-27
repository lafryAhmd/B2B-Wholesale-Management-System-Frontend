import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Edit, Trash2 } from 'lucide-react';

const API_URL = '/api';

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`${API_URL}/orders/${id}`);
                setOrder(res.data);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleApprove = async () => {
        setProcessing(true);
        try {
            // Hardcoded adminId for demo purposes
            await axios.post(`${API_URL}/orders/${id}/approve?adminId=1`);
            // Refresh order data
            const res = await axios.get(`${API_URL}/orders/${id}`);
            setOrder(res.data);
            alert('Order approved successfully!');
        } catch (error) {
            console.error('Error approving order:', error);
            alert(error.response?.data?.message || 'Failed to approve order');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return 'badge-approved';
            case 'REJECTED': return 'badge-rejected';
            case 'PENDING_APPROVAL': return 'badge-pending';
            default: return 'badge-pending';
        }
    };

    if (loading) return <div>Loading order details...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/orders')}
                className="btn btn-secondary"
                style={{ marginBottom: '1.5rem', background: 'transparent', border: 'none', padding: 0 }}
            >
                <ArrowLeft size={16} /> Back to Orders
            </button>

            <div className="page-header" style={{ marginBottom: '1rem' }}>
                <div>
                    <h2 className="page-title">Order #{order.orderNumber}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Placed on {new Date(order.orderDate).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className={`badge ${getStatusBadge(order.status)}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        {order.status.replace('_', ' ')}
                    </span>

                    {order.status === 'PENDING_APPROVAL' && (
                        <button
                            onClick={handleApprove}
                            disabled={processing}
                            className="btn btn-primary"
                        >
                            <CheckCircle size={18} /> {processing ? 'Approving...' : 'Approve Order'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Order Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem 1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Customer ID:</span>
                        <span style={{ fontWeight: 500 }}>{order.customerId}</span>

                        <span style={{ color: 'var(--text-muted)' }}>Business ID:</span>
                        <span style={{ fontWeight: 500 }}>{order.businessId}</span>

                        <span style={{ color: 'var(--text-muted)' }}>Approval Type:</span>
                        <span>{order.approvalType || 'Pending'}</span>

                        {order.autoApprovalReason && (
                            <>
                                <span style={{ color: 'var(--text-muted)' }}>System Note:</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>"{order.autoApprovalReason}"</span>
                            </>
                        )}

                        {order.notes && (
                            <>
                                <span style={{ color: 'var(--text-muted)' }}>User Notes:</span>
                                <span>{order.notes}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', fontSize: '1.125rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                        <span>${order.totalAmount?.toFixed(2)}</span>

                        <span style={{ color: 'var(--text-muted)' }}>Discount:</span>
                        <span>-${order.discountAmount?.toFixed(2)}</span>

                        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }}></div>

                        <span style={{ fontWeight: 700 }}>Total:</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>${order.finalAmount?.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="card table-container">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Order Items</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Discount</th>
                            <th style={{ textAlign: 'right' }}>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => (
                            <tr key={index}>
                                <td style={{ fontWeight: 500 }}>{item.productId}</td>
                                <td>{item.quantity}</td>
                                <td>${item.unitPrice?.toFixed(2)}</td>
                                <td>{item.discountPercent}%</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>${item.lineTotal?.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
