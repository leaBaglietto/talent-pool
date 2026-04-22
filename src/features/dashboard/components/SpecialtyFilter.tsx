import { PROFILE_TYPES } from '@/lib/types'
import { Filter } from 'lucide-react'

interface SpecialtyFilterProps {
  value: string
  onChange: (value: string) => void
  totalCount: number
  filteredCount: number
}

export default function SpecialtyFilter({ value, onChange, totalCount, filteredCount }: SpecialtyFilterProps) {
  return (
    <div className="specialty-filter">
      <div className="filter-control">
        <Filter size={16} />
        <select
          className="input-field filter-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Filtrar por especialidad"
          id="specialty-filter"
        >
          <option value="">Todos</option>
          {PROFILE_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <span className="filter-count">
        {filteredCount === totalCount
          ? `${totalCount} perfiles`
          : `${filteredCount} de ${totalCount} perfiles`}
      </span>

      <style>{`
        .specialty-filter {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-muted);
        }

        .filter-select {
          width: auto;
          min-width: 200px;
          padding: 0.5rem 2.25rem 0.5rem 0.75rem;
          font-size: 0.8125rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
        }

        .filter-select option {
          background: var(--color-bg-card);
          color: var(--color-text-primary);
        }

        .filter-count {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
