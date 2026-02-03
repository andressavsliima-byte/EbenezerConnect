import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, settingsAPI } from '../api';
export default function AdminDashboardBackup() {
  return null;
}
      ? 'text-amber-200'
      : 'text-sky-200';

  return (
    <div className="hero-metric">
      <div className="flex items-center justify-between gap-3">
        <div>
          <small>{meta}</small>
          <strong>{value}</strong>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
          <Icon className="w-5 h-5 text-white" />
        </span>
      </div>
      <div className="mt-2 text-sm text-white/80">
        {label}
      </div>
      <div className={`text-xs font-semibold tracking-wide mt-1 ${toneClass}`}>
        {trend}
      </div>
    </div>
  );
}

function InsightItem({ title, value, detail, icon: Icon }) {
  return (
    <li className="insight-item">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">{title}</p>
          <p className="insight-item-value">{value}</p>
          <p className="text-sm text-gray-500">{detail}</p>
        </div>
      </div>
    </li>
  );
}

function StatCard({ title, value, icon: Icon, accent, link }) {
  const CardWrapper = link ? Link : 'div';
  const displayValue = typeof value === 'number' ? new Intl.NumberFormat('pt-BR').format(value) : value;

  return (
    <CardWrapper
      to={link}
      className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-lg shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-2xl ${link ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">{title}</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">{displayValue}</p>
        </div>
        <span className={`rounded-2xl p-3 ${accent}`}>
          <Icon className="w-6 h-6" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-200 to-transparent opacity-0 transition group-hover:opacity-100"></div>
    </CardWrapper>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50 py-10 text-center">
      <div className="rounded-full bg-white p-3 shadow-md">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}

function badgeForStatus(status) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-rose-100 text-rose-600';
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-600';
  }
}

function translateStatus(status) {
  switch (status) {
    case 'confirmed':
      return 'Confirmado';
    case 'rejected':
      return 'Rejeitado';
    case 'pending':
    default:
      return 'Pendente';
  }
}
