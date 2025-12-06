// Example: How to use the Table component

import React, { useState } from 'react'
import Table, { TableColumn } from '@/components/ui/Table'
import Button from '@/components/ui/Button'

// Example data type
type User = {
  id: string
  name: string
  email: string
  role: 'ALUMNO' | 'FEMME' | 'PROFESOR' | 'DIRECTOR'
  active: boolean
  createdAt: string
}

const mockUsers: User[] = [
  { id: '1', name: 'Ana García', email: 'ana@femme.bo', role: 'ALUMNO', active: true, createdAt: '2024-01-15' },
  { id: '2', name: 'Luis Pérez', email: 'luis@femme.bo', role: 'PROFESOR', active: true, createdAt: '2024-02-20' },
  { id: '3', name: 'María López', email: 'maria@femme.bo', role: 'FEMME', active: false, createdAt: '2024-03-10' },
]

export default function UsersTableExample() {
  const [users] = useState<User[]>(mockUsers)
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<keyof User | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  
  const pageSize = 10

  // Define columns
  const columns: TableColumn<User>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (user) => (
        <div className="font-medium text-gray-900">{user.name}</div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (user) => (
        <div className="text-gray-600">{user.email}</div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.role}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Estado',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.active ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '120px',
      render: (user) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost">
            Editar
          </Button>
          <Button size="sm" variant="outline">
            {user.active ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      ),
    },
  ]

  // Handle sorting
  const handleSort = (key: keyof User | string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key as keyof User)
      setSortDirection('asc')
    }
  }

  // Simulate loading
  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <Button onClick={handleRefresh}>
          Refrescar datos
        </Button>
      </div>

      <Table
        data={users}
        columns={columns}
        loading={loading}
        
        // Sorting
        sorting={{
          key: sortKey,
          direction: sortDirection,
          onSort: handleSort,
        }}
        
        // Pagination
        pagination={{
          currentPage,
          totalPages: Math.ceil(users.length / pageSize),
          pageSize,
          totalItems: users.length,
          onPageChange: setCurrentPage,
          showInfo: true,
        }}
        
        // Empty state
        emptyState={{
          title: 'No hay usuarios',
          description: 'Aún no se han registrado usuarios en el sistema.',
          action: (
            <Button variant="primary">
              Crear primer usuario
            </Button>
          ),
        }}
        
        // Row click handler
        onRowClick={(user) => {
          console.log('Clicked user:', user)
        }}
        
        // Custom row styling
        rowClassName={(user) => 
          !user.active ? 'opacity-60' : ''
        }
      />
    </div>
  )
}

/*
USAGE EXAMPLES:

// Basic table
<Table 
  data={users} 
  columns={columns} 
/>

// With loading
<Table 
  data={users} 
  columns={columns} 
  loading={isLoading}
/>

// With pagination
<Table 
  data={users} 
  columns={columns} 
  pagination={{
    currentPage: 1,
    totalPages: 5,
    pageSize: 10,
    totalItems: 50,
    onPageChange: (page) => setPage(page)
  }}
/>

// With sorting
<Table 
  data={users} 
  columns={columns} 
  sorting={{
    key: 'name',
    direction: 'asc',
    onSort: (key) => handleSort(key)
  }}
/>

// Custom empty state
<Table 
  data={[]} 
  columns={columns} 
  emptyState={{
    title: 'No users found',
    description: 'Try adjusting your search criteria.',
    action: <Button>Add User</Button>
  }}
/>
*/
