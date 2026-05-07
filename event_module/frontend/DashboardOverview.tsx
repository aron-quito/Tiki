import React from 'react';
import { Users, Ticket, TrendingUp, DollarSign } from 'lucide-react';
import './DashboardOverview.css';

const DashboardOverview: React.FC = () => {
  return (
    <div className="overview-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            <Ticket size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Tickets Vendidos</p>
            <h3 className="stat-value">2,450</h3>
            <p className="stat-change positive">+12% vs mes anterior</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ingresos Totales</p>
            <h3 className="stat-value">$45,200</h3>
            <p className="stat-change positive">+8% vs mes anterior</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF2F2', color: '#EF4444' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Asistencia Promedio</p>
            <h3 className="stat-value">85%</h3>
            <p className="stat-change negative">-2% vs mes anterior</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FFFBEB', color: '#F59E0B' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Conversión</p>
            <h3 className="stat-value">3.2%</h3>
            <p className="stat-change positive">+1.1% vs mes anterior</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card placeholder-chart">
          <h3>Resumen de Ventas (Placeholder)</h3>
          <div className="chart-skeleton"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
