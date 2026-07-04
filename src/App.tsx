import React, { useState, useEffect } from "react"
import "./styles.css"

interface Task { id: string; title: string; desc: string; priority: "baixa" | "media" | "alta" }

const COLUMNS = ["A Fazer", "Em Andamento", "Revisão", "Concluído"]

function loadTasks(): Record<string, Task[]> {
  try { return JSON.parse(localStorage.getItem("tasks") || JSON.stringify(Object.fromEntries(COLUMNS.map(c => [c, []])))) }
  catch { return Object.fromEntries(COLUMNS.map(c => [c, []])) }
}

export default function App() {
  const [columns, setColumns] = useState<Record<string, Task[]>>(loadTasks)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media")
  const [dragTask, setDragTask] = useState<{ task: Task; from: string } | null>(null)

  useEffect(() => { localStorage.setItem("tasks", JSON.stringify(columns)) }, [columns])

  const addTask = () => {
    if (!title.trim()) return
    const task: Task = { id: Date.now().toString(), title, desc, priority }
    setColumns(prev => ({ ...prev, "A Fazer": [...prev["A Fazer"], task] }))
    setTitle(""); setDesc(""); setPriority("media"); setShowModal(false)
  }

  const moveTask = (col: string) => {
    if (!dragTask) return
    setColumns(prev => ({
      ...prev,
      [dragTask.from]: prev[dragTask.from].filter(t => t.id !== dragTask.task.id),
      [col]: [...prev[col], dragTask.task]
    }))
    setDragTask(null)
  }

  const deleteTask = (col: string, id: string) => {
    setColumns(prev => ({ ...prev, [col]: prev[col].filter(t => t.id !== id) }))
  }

  const totalTasks = Object.values(columns).flat().length
  const doneTasks = columns["Concluído"].length

  return React.createElement("div", { className: "app" },
    React.createElement("header", { className: "header" },
      React.createElement("div", { className: "container header-inner" },
        React.createElement("div", null,
          React.createElement("h1", null, "📋 TaskFlow"),
          React.createElement("span", { className: "header-stats" }, `${doneTasks}/${totalTasks} concluídas`)
        ),
        React.createElement("button", { className: "add-btn", onClick: () => setShowModal(true) },
          React.createElement("i", { className: "fa-solid fa-plus" }), " Nova Tarefa"
        )
      )
    ),
    React.createElement("main", { className: "container board" },
      COLUMNS.map(col => React.createElement("div", {
        key: col, className: "column",
        onDragOver: (e: any) => e.preventDefault(),
        onDrop: () => moveTask(col)
      },
        React.createElement("div", { className: "column-header" },
          React.createElement("h3", null, col),
          React.createElement("span", { className: "column-count" }, columns[col].length)
        ),
        columns[col].map(task => React.createElement("div", {
          key: task.id, className: `task-card priority-${task.priority}`,
          draggable: true,
          onDragStart: () => setDragTask({ task, from: col })
        },
          React.createElement("div", { className: "task-header" },
            React.createElement("span", { className: `priority-badge ${task.priority}` }, task.priority),
            React.createElement("button", { className: "delete-btn", onClick: () => deleteTask(col, task.id) },
              React.createElement("i", { className: "fa-solid fa-trash" })
            )
          ),
          React.createElement("h4", null, task.title),
          task.desc && React.createElement("p", null, task.desc)
        ))
      ))
    ),
    showModal && React.createElement("div", { className: "modal-overlay", onClick: () => setShowModal(false) },
      React.createElement("div", { className: "modal", onClick: (e: any) => e.stopPropagation() },
        React.createElement("h2", null, "Nova Tarefa"),
        React.createElement("input", { placeholder: "Título", value: title, onChange: (e: any) => setTitle(e.target.value), autoFocus: true }),
        React.createElement("textarea", { placeholder: "Descrição (opcional)", value: desc, onChange: (e: any) => setDesc(e.target.value) }),
        React.createElement("select", { value: priority, onChange: (e: any) => setPriority(e.target.value) },
          React.createElement("option", { value: "baixa" }, "🟢 Baixa"),
          React.createElement("option", { value: "media" }, "🟡 Média"),
          React.createElement("option", { value: "alta" }, "🔴 Alta")
        ),
        React.createElement("div", { className: "modal-actions" },
          React.createElement("button", { className: "cancel-btn", onClick: () => setShowModal(false) }, "Cancelar"),
          React.createElement("button", { className: "add-btn", onClick: addTask }, "Adicionar")
        )
      )
    )
  )
}
