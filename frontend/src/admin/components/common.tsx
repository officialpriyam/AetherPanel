'use client';

import Link from 'next/link';
import React, { ReactNode } from 'react';
import { LuSave, LuServer, LuShield, LuWand } from 'react-icons/lu';
import type { FormField } from '../config';

function Glyph({ icon, className }: { icon: any; className?: string }) {
    const Component = icon as any;
    return <Component className={className} />;
}

function Banner({ tone, children }: { tone: 'danger' | 'warning'; children: ReactNode }) {
    return <div className={`admin-banner admin-banner--${tone}`}>{children}</div>;
}

function PageHero({
    title,
    description,
    tone,
    brandName,
    showMeta = false,
}: {
    title: string;
    description: string;
    tone: 'default' | 'settings' | 'flash';
    brandName: string;
    showMeta?: boolean;
}) {
    const toneLabel = tone === 'flash' ? 'Theme Studio' : tone === 'settings' ? 'Runtime Policy' : 'Operations Layer';
    const toneSummary = tone === 'flash'
        ? 'Brand, layout, palette, and customer-facing visual controls.'
        : tone === 'settings'
            ? 'Application identity, sessions, security, mail, and backend behavior.'
            : 'Infrastructure, resource inventory, and administrative workflows.';
    const heroIcon = tone === 'flash' ? LuWand : tone === 'settings' ? LuShield : LuServer;

    return (
        <section className={`admin-hero admin-hero--${tone}${showMeta ? '' : ' admin-hero--solo'}`}>
            <div className="admin-hero__lead">
                <div className="admin-hero__icon">
                    <Glyph icon={heroIcon} />
                </div>
                <div className="admin-hero__copy">
                    <div className="admin-hero__pill">{toneLabel}</div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </div>
            {showMeta ? (
                <div className="admin-hero__meta">
                    <div className="admin-hero__meta-card">
                        <span>Platform</span>
                        <strong>{brandName}</strong>
                        <small>Dedicated admin workspace backed by the platform API.</small>
                    </div>
                    <div className="admin-hero__meta-card">
                        <span>Focus</span>
                        <strong>{toneLabel}</strong>
                        <small>{toneSummary}</small>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function StatusBadge({ tone, children }: { tone: 'success' | 'danger' | 'warning' | 'neutral'; children: ReactNode }) {
    return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

function Panel({ title, copy, actions, children }: { title: string; copy?: string; actions?: ReactNode; children: ReactNode }) {
    return (
        <section className="admin-panel">
            <div className="admin-panel__header">
                <div>
                    <h3>{title}</h3>
                    {copy ? <p>{copy}</p> : null}
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}

function DetailList({ title, items }: { title: string; items: [string, string][] }) {
    return (
        <Panel title={title}>
            <div className="admin-detail-grid">
                {items.map(([label, value]) => (
                    <div key={label} className="admin-detail-grid__item">
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

function SimpleTable({ title, columns, rows, emptyLabel }: { title: string; columns: string[]; rows: ReactNode[][]; emptyLabel: string }) {
    return (
        <Panel title={title}>
            {rows.length ? (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {columns.map((column) => <th key={column}>{column}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    {row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="admin-empty">{emptyLabel}</div>
            )}
        </Panel>
    );
}

function SubnavTabs({ baseHref, items, activeId }: { baseHref: string; items: { id: string; label: string; description: string }[]; activeId: string }) {
    return (
        <div className="admin-tabs">
            {items.map((item) => (
                <Link key={item.id} href={item.id === 'index' ? baseHref : `${baseHref}/${item.id}`} className={`admin-tabs__item${item.id === activeId ? ' is-active' : ''}`}>
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                </Link>
            ))}
        </div>
    );
}

function FieldEditor({
    field,
    value,
    onChange,
    refs,
    values,
}: {
    field: FormField;
    value: string;
    onChange: (value: string) => void;
    refs?: Record<string, any>;
    values?: Record<string, string>;
}) {
    const baseProps = {
        value,
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.currentTarget.value),
    };
    const selectOptions = field.type === 'select' ? (field.getOptions ? field.getOptions(refs || {}, values || {}) : field.options || []) : [];
    const hasCurrentValue = selectOptions.some((option) => String(option.value) === value);

    return (
        <label className={`admin-field${field.inputWidth === 'compact' ? ' admin-field--compact' : ''}`}>
            <span>{field.label}</span>
            {field.type === 'textarea' || field.type === 'list' ? <textarea {...baseProps} rows={field.rows || 5} /> : null}
            {field.type === 'select' ? (
                <select {...baseProps}>
                    {field.emptyOptionLabel || !value ? <option value="">{field.emptyOptionLabel || 'Select an option'}</option> : null}
                    {!hasCurrentValue && value ? <option value={value}>{`Current: ${value}`}</option> : null}
                    {selectOptions.map((option) => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}
                </select>
            ) : null}
            {field.type === 'boolean' ? (
                <select {...baseProps}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                </select>
            ) : null}
            {['text', 'url', 'number', 'color', 'password'].includes(field.type) ? (
                <input {...baseProps} type={field.type === 'list' ? 'text' : field.type} placeholder={field.placeholder} />
            ) : null}
            {field.description ? <small>{field.description}</small> : null}
        </label>
    );
}

export { Glyph, Banner, PageHero, StatusBadge, Panel, DetailList, SimpleTable, SubnavTabs, FieldEditor };
