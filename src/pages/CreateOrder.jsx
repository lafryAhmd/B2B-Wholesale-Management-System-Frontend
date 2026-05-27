import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

const API_URL = '/api';

export default function CreateOrder() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        customerId: '',
        businessId: '',
        notes: '',
        items: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, bizRes, prodRes] = await Promise.all([
                    axios.get(`${API_URL}/customers`),
                    axios.get(`${API_URL}/businesses`),
                    axios.get(`${API_URL}/products`)
                ]);
                setCustomers(custRes.data);
                setBusinesses(bizRes.data);
                setProducts(prodRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1 }]
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customerId || !formData.businessId || formData.items.length === 0) {
            alert("Please select a customer, a business, and add at least one item.");
            return;
        }

        // Validate MOQs
        for (const item of formData.items) {
            const product = products.find(p => p.id === Number(item.productId));
            if (product && item.quantity < product.moq) {
                alert(`Quantity for ${product.name} must be at least ${product.moq} (MOQ).`);
                return;
            }
            if (product && item.quantity > product.stock) {
                alert(`Quantity for ${product.name} exceeds available stock (${product.stock}). This may require manual approval.`);
            }
        }

        try {
            await axios.post(`${API_URL}/orders`, formData);
            navigate('/orders');
        } catch (error) {
            console.error('Error creating order:', error);
            alert(error.response?.data?.message || 'Failed to create order');
        }
    };

    const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));
    const selectedBusiness = businesses.find(b => b.id === Number(formData.businessId));

    if (loading) return <div>Loading form...</div>;

    const publishedProducts = products.filter(p => p.businessId === Number(formData.businessId));

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header">
                <h2 className="page-title">Create Bulk Order</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Order Details</h3>

                    <div className="form-group grid grid-2">
                        <div>
                            <label className="form-label">Select Customer (Buyer)</label>
                            <select
                                className="form-control"
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                required
                            >
                                <option value="">-- Choose a customer --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.regNumber})</option>
                                ))}
                            </select>
                        </div>

                        {selectedCustomer && (
                            <div style={{ padding: '1rem', backgroundColor: '#F3F4F6', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Credit Limit:</span>
                                    <span style={{ fontWeight: 600 }}>${selectedCustomer.creditLimit.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Risk Level:</span>
                                    <span className={`badge badge-${selectedCustomer.riskLevel.toLowerCase()}`}>
                                        {selectedCustomer.riskLevel === 'HIGH' ? <ShieldAlert size={12} style={{ marginRight: 4 }} /> : <CheckCircle2 size={12} style={{ marginRight: 4 }} />}
                                        {selectedCustomer.riskLevel}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group grid grid-2">
                        <div>
                            <label className="form-label">Select Business (Vendor)</label>
                            <select
                                className="form-control"
                                value={formData.businessId}
                                onChange={(e) => {
                                    if (e.target.value !== formData.businessId) {
                                        setFormData(prev => ({ ...prev, businessId: e.target.value, items: [] }));
                                    } else {
                                        setFormData({ ...formData, businessId: e.target.value });
                                    }
                                }}
                                required
                            >
                                <option value="">-- Choose a business --</option>
                                {businesses.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.regNumber})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Order Notes</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Any special instructions or delivery details..."
                        ></textarea>
                    </div>
                </div>

                {formData.businessId && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0 }}>Order Items</h3>
                            <button type="button" onClick={handleAddItem} className="btn btn-secondary">
                                <Plus size={16} /> Add Product
                            </button>
                        </div>

                        {formData.items.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No items added yet. Click 'Add Product' to begin.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {formData.items.map((item, index) => {
                                    const selectedProduct = products.find(p => p.id === Number(item.productId));
                                    return (
                                        <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                            <div style={{ flex: 2 }}>
                                                <label className="form-label">Product</label>
                                                <select
                                                    className="form-control"
                                                    value={item.productId}
                                                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- Select Product --</option>
                                                    {publishedProducts.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} - ${p.basePrice}/unit</option>
                                                    ))}
                                                </select>
                                                {selectedProduct && (
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                        Stock: <span style={{ fontWeight: 600, color: selectedProduct.stock < item.quantity ? 'var(--danger)' : 'inherit' }}>{selectedProduct.stock}</span> | MOQ: {selectedProduct.moq}
                                                    </p>
                                                )}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <label className="form-label">Quantity</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                    required
                                                />
                                            </div>

                                            <div style={{ paddingTop: '1.75rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="btn btn-danger"
                                                    style={{ padding: '0.75rem' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" onClick={() => navigate('/orders')} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={formData.items.length === 0 || !formData.businessId || !formData.customerId}>
                        Submit Order Request
                    </button>
                </div>
            </form>
        </div>
    );
}
