'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, FileText } from 'lucide-react'
import { Button, Loading } from '@/shared/ui'
import { APP_NAME } from '@/lib/config'
import {
  getAllAboutSections, createAboutSection, updateAboutSection, deleteAboutSection,
  getAllAboutActivities, createAboutActivity, updateAboutActivity, deleteAboutActivity,
  getAllAboutHistory, createAboutHistoryItem, updateAboutHistoryItem, deleteAboutHistoryItem,
  getAllAboutContacts, createAboutContact, updateAboutContact, deleteAboutContact,
} from '@/shared/api/supabase'
import type { AboutSection, AboutActivity, AboutHistory, AboutContact } from '@/types/supabase'
import { TabType, ViewMode, SectionFormData, AboutActivityFormData, HistoryFormData, ContactFormData } from './types'
import Notification from './components/Notification'
import TabNavigation from './components/TabNavigation'
import SectionCard from './components/cards/SectionCard'
import { AboutActivityCard } from './components/cards/AboutActivityCard'
import HistoryCard from './components/cards/HistoryCard'
import ContactCard from './components/cards/ContactCard'
import SectionForm from './components/forms/SectionForm'
import AboutActivityForm from './components/forms/AboutActivityForm'
import HistoryForm from './components/forms/HistoryForm'
import ContactForm from './components/forms/ContactForm'
import DeleteConfirmView from './components/DeleteConfirmView'

type FormData = SectionFormData | AboutActivityFormData | HistoryFormData | ContactFormData
type DataItem = AboutSection | AboutActivity | AboutHistory | AboutContact

const TAB_LABELS: Record<TabType, string> = { sections: '섹션', activities: '활동', history: '연혁', contact: '연락처' }

const getEmptyFormData = (tab: TabType): FormData => {
  const base = { order: 0 }
  switch (tab) {
    case 'sections': return { ...base, title: '', content: '' }
    case 'activities': return { ...base, title: '', description: '', icon: '', color: '' }
    case 'history': return { ...base, year: new Date().getFullYear(), title: '', description: '' }
    case 'contact': return { ...base, type: '', label: '', value: '' }
  }
}

const itemToFormData = (tab: TabType, item: DataItem): FormData => {
  const base = { order: item.order }
  switch (tab) {
    case 'sections': { const i = item as AboutSection; return { ...base, title: i.title, content: i.content } }
    case 'activities': { const i = item as AboutActivity; return { ...base, title: i.title, description: i.description, icon: i.icon, color: i.color } }
    case 'history': { const i = item as AboutHistory; return { ...base, year: i.year, title: i.title, description: i.description } }
    case 'contact': { const i = item as AboutContact; return { ...base, type: i.type, label: i.label, value: i.value } }
  }
}

export default function AboutManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [activeTab, setActiveTab] = useState<TabType>('sections')
  const [sections, setSections] = useState<AboutSection[]>([])
  const [activities, setActivities] = useState<AboutActivity[]>([])
  const [history, setHistory] = useState<AboutHistory[]>([])
  const [contacts, setContacts] = useState<AboutContact[]>([])
  const [editingItem, setEditingItem] = useState<DataItem | null>(null)
  const [formData, setFormData] = useState<FormData>(getEmptyFormData('sections'))
  const [initialFormData, setInitialFormData] = useState<FormData>(getEmptyFormData('sections'))
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string; hiding: boolean }>({ show: false, type: 'success', title: '', message: '', hiding: false })
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  const hasChanges = useMemo(() => JSON.stringify(formData) !== JSON.stringify(initialFormData), [formData, initialFormData])
  const dataMap = { sections, activities, history, contact: contacts }
  const getCurrentItems = () => dataMap[activeTab]
  const getItemTitle = (item: DataItem | null) => item ? ('title' in item ? item.title : 'label' in item ? item.label : '') : ''

  useEffect(() => { document.title = `소개 관리 - ${APP_NAME}`; fetchAllData() }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [s, a, h, c] = await Promise.all([getAllAboutSections(), getAllAboutActivities(), getAllAboutHistory(), getAllAboutContacts()])
      setSections(s); setActivities(a); setHistory(h); setContacts(c)
    } catch (e) { console.error(e); notify('error', '오류', '데이터를 불러오는데 실패했습니다.') }
    finally { setLoading(false) }
  }

  const notify = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message, hiding: false })
    setTimeout(() => { setNotification(p => ({ ...p, hiding: true })); setTimeout(() => setNotification({ show: false, type: type, title: '', message: '', hiding: false }), 300) }, 3000)
  }

  const handleAdd = () => { const d = getEmptyFormData(activeTab); setEditingItem(null); setFormData(d); setInitialFormData(d); setViewMode('add') }
  const handleEdit = (item: DataItem) => { const d = itemToFormData(activeTab, item); setEditingItem(item); setFormData(d); setInitialFormData(d); setViewMode('edit') }
  const handleDeleteClick = (item: DataItem) => { setEditingItem(item); setViewMode('delete') }
  const handleFormChange = (field: string, value: string | number) => setFormData(p => ({ ...p, [field]: value }))
  const handleCancel = () => hasChanges ? setShowUnsavedDialog(true) : setViewMode('list')

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const isEdit = viewMode === 'edit' && editingItem
      const is_active = isEdit ? editingItem!.is_active : true

      if (activeTab === 'sections') {
        const d = formData as SectionFormData
        if (isEdit) await updateAboutSection(editingItem!.id, { ...d, is_active })
        else await createAboutSection({ ...d, is_active })
      } else if (activeTab === 'activities') {
        const d = formData as AboutActivityFormData
        if (isEdit) await updateAboutActivity(editingItem!.id, { ...d, is_active })
        else await createAboutActivity({ ...d, is_active })
      } else if (activeTab === 'history') {
        const d = formData as HistoryFormData
        if (isEdit) await updateAboutHistoryItem(editingItem!.id, { ...d, is_active })
        else await createAboutHistoryItem({ ...d, is_active })
      } else {
        const d = formData as ContactFormData
        if (isEdit) await updateAboutContact(editingItem!.id, { ...d, is_active })
        else await createAboutContact({ ...d, is_active })
      }
      notify('success', isEdit ? '수정 완료' : '생성 완료', `${TAB_LABELS[activeTab]}이(가) 성공적으로 ${isEdit ? '수정' : '생성'}되었습니다.`)
      await fetchAllData(); setViewMode('list')
    } catch (e) { console.error(e); notify('error', '오류', `${TAB_LABELS[activeTab]} 저장에 실패했습니다.`) }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!editingItem) return
    try {
      setIsSubmitting(true)
      const deleteFns = { sections: deleteAboutSection, activities: deleteAboutActivity, history: deleteAboutHistoryItem, contact: deleteAboutContact }
      await deleteFns[activeTab](editingItem.id)
      notify('success', '삭제 완료', `${TAB_LABELS[activeTab]}이(가) 삭제되었습니다.`)
      await fetchAllData(); setViewMode('list')
    } catch (e) { console.error(e); notify('error', '오류', '삭제에 실패했습니다.') }
    finally { setIsSubmitting(false) }
  }

  if (loading) return <div className="min-h-screen bg-black flex justify-center items-center"><Loading text="소개 내용을 불러오는 중..." size="lg" /></div>

  const formProps = { onChange: handleFormChange, onSubmit: handleSubmit, onCancel: handleCancel, isSubmitting, hasChanges, mode: viewMode as 'add' | 'edit' }

  return (
    <div className="min-h-screen bg-black">
      {viewMode === 'list' && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">소개 관리</h1>
            <p className="text-gray-400">소개 페이지의 각 섹션을 관리할 수 있습니다.</p>
          </div>
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} counts={{ sections: sections.length, activities: activities.length, history: history.length, contact: contacts.length }} />
          <div className="mb-6">
            <Button onClick={handleAdd} variant="primary"><Plus className="w-5 h-5 mr-2" />{TAB_LABELS[activeTab]} 추가</Button>
          </div>
          {getCurrentItems().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-6"><FileText className="w-12 h-12 text-violet-400" /></div>
              <h3 className="text-xl font-semibold text-white mb-2">아직 등록된 {TAB_LABELS[activeTab]}이(가) 없습니다</h3>
              <p className="text-gray-500 text-sm mb-6">첫 번째 {TAB_LABELS[activeTab]}을(를) 추가해보세요</p>
              <Button onClick={handleAdd}><Plus className="w-5 h-5 mr-2" />{TAB_LABELS[activeTab]} 추가하기</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'sections' && sections.map(i => <SectionCard key={i.id} section={i} onEdit={() => handleEdit(i)} onDelete={() => handleDeleteClick(i)} />)}
              {activeTab === 'activities' && activities.map(i => <AboutActivityCard key={i.id} activity={i} onEdit={() => handleEdit(i)} onDelete={() => handleDeleteClick(i)} />)}
              {activeTab === 'history' && history.map(i => <HistoryCard key={i.id} history={i} onEdit={() => handleEdit(i)} onDelete={() => handleDeleteClick(i)} />)}
              {activeTab === 'contact' && contacts.map(i => <ContactCard key={i.id} contact={i} onEdit={() => handleEdit(i)} onDelete={() => handleDeleteClick(i)} />)}
            </div>
          )}
        </>
      )}

      {(viewMode === 'add' || viewMode === 'edit') && (
        <>
          {activeTab === 'sections' && <SectionForm formData={formData as SectionFormData} {...formProps} />}
          {activeTab === 'activities' && <AboutActivityForm formData={formData as AboutActivityFormData} {...formProps} />}
          {activeTab === 'history' && <HistoryForm formData={formData as HistoryFormData} {...formProps} />}
          {activeTab === 'contact' && <ContactForm formData={formData as ContactFormData} {...formProps} />}
        </>
      )}

      {viewMode === 'delete' && <DeleteConfirmView itemType={activeTab} itemTitle={getItemTitle(editingItem)} onConfirm={handleDelete} onCancel={() => setViewMode('list')} isDeleting={isSubmitting} />}

      {showUnsavedDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">저장되지 않은 변경사항</h3>
            <p className="text-gray-400 mb-6">변경사항을 저장하지 않고 나가시겠습니까?</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowUnsavedDialog(false)}>취소</Button>
              <Button variant="ghost" onClick={() => { setShowUnsavedDialog(false); handleSubmit() }}>저장하고 나가기</Button>
              <Button className="bg-red-500 hover:bg-red-600" onClick={() => { setShowUnsavedDialog(false); setViewMode('list') }}>저장 안함</Button>
            </div>
          </div>
        </div>
      )}

      <Notification show={notification.show} type={notification.type} title={notification.title} message={notification.message} hiding={notification.hiding} onClose={() => setNotification(p => ({ ...p, show: false }))} />
    </div>
  )
}
