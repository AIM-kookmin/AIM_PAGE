'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, Loading } from '@/shared/ui'
import { APP_NAME } from '@/lib/config'
import {
  getAllAboutSections, createAboutSection, updateAboutSection, deleteAboutSection,
  getAllAboutActivities, createAboutActivity, updateAboutActivity, deleteAboutActivity,
  getAllAboutHistory, createAboutHistoryItem, updateAboutHistoryItem, deleteAboutHistoryItem,
  getAllAboutContacts, createAboutContact, updateAboutContact, deleteAboutContact,
  updateAboutSectionsOrder, updateAboutActivitiesOrder, updateAboutHistoryOrder, updateAboutContactsOrder,
} from '@/shared/api/supabase'
import type { AboutSection, AboutActivity, AboutHistory, AboutContact } from '@/types/supabase'
import { EditContext, ViewMode, SectionFormData, AboutActivityFormData, HistoryFormData, ContactFormData } from './types'
import Notification from './components/Notification'
import HeroPreview from './components/HeroPreview'
import PreviewSection from './components/PreviewSection'
import SectionCard from './components/cards/SectionCard'
import AboutActivityCard from './components/cards/AboutActivityCard'
import ContactCard from './components/cards/ContactCard'
import SectionForm from './components/forms/SectionForm'
import AboutActivityForm from './components/forms/AboutActivityForm'
import HistoryForm from './components/forms/HistoryForm'
import ContactForm from './components/forms/ContactForm'
import DeleteConfirmView from './components/DeleteConfirmView'
import ReorderableList from './components/ReorderableList'
import ReorderableHistoryList from './components/ReorderableHistoryList'
import useReorderWithSave from './hooks/useReorderWithSave'

type FormData = SectionFormData | AboutActivityFormData | HistoryFormData | ContactFormData
type DataItem = AboutSection | AboutActivity | AboutHistory | AboutContact

const CONTEXT_LABELS: Record<EditContext, string> = { sections: '섹션', activities: '활동', history: '연혁', contact: '연락처' }
const CONTACT_TYPE_ORDER = { email: 0, github: 1, instagram: 2, phone: 999 }

const getEmptyFormData = (context: EditContext, maxOrder: number): FormData => {
  const base = { order: maxOrder + 1 }
  switch (context) {
    case 'sections': return { ...base, title: '', content: '' }
    case 'activities': return { ...base, title: '', description: '', icon: '', color: '' }
    case 'history': return { year: new Date().getFullYear(), title: '', description: '' }
    case 'contact': return { ...base, type: '', label: '', value: '' }
  }
}

const itemToFormData = (context: EditContext, item: DataItem): FormData => {
  const base = { order: item.order }
  switch (context) {
    case 'sections': { const i = item as AboutSection; return { ...base, title: i.title, content: i.content } }
    case 'activities': { const i = item as AboutActivity; return { ...base, title: i.title, description: i.description, icon: i.icon, color: i.color } }
    case 'history': { const i = item as AboutHistory; return { year: i.year, title: i.title, description: i.description } }
    case 'contact': { const i = item as AboutContact; return { ...base, type: i.type, label: i.label, value: i.value } }
  }
}

export default function AboutManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editContext, setEditContext] = useState<EditContext>('sections')
  const [sections, setSections] = useState<AboutSection[]>([])
  const [activities, setActivities] = useState<AboutActivity[]>([])
  const [history, setHistory] = useState<AboutHistory[]>([])
  const [contacts, setContacts] = useState<AboutContact[]>([])
  const [editingItem, setEditingItem] = useState<DataItem | null>(null)
  const [formData, setFormData] = useState<FormData>(getEmptyFormData('sections', 0))
  const [initialFormData, setInitialFormData] = useState<FormData>(getEmptyFormData('sections', 0))
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string; hiding: boolean }>({ show: false, type: 'success', title: '', message: '', hiding: false })
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  // Reorder hooks for each tab
  const sectionsReorder = useReorderWithSave({
    initialItems: sections,
    onSave: async (updates: AboutSection[]) => {
      await updateAboutSectionsOrder(updates)
      // fetchAllData 제거: 로컬 상태가 이미 올바른 순서를 가지고 있음
    },
    debounceMs: 2000, // 2초 후 저장
  })

  const activitiesReorder = useReorderWithSave({
    initialItems: activities,
    onSave: async (updates: AboutActivity[]) => {
      await updateAboutActivitiesOrder(updates)
      // fetchAllData 제거: 로컬 상태가 이미 올바른 순서를 가지고 있음
    },
    debounceMs: 2000, // 2초 후 저장
  })

  const historyReorder = useReorderWithSave({
    initialItems: history,
    onSave: async (updates: AboutHistory[]) => {
      await updateAboutHistoryOrder(updates)
      // fetchAllData 제거: 로컬 상태가 이미 올바른 순서를 가지고 있음
    },
    debounceMs: 2000, // 2초 후 저장
  })

  const contactsReorder = useReorderWithSave({
    initialItems: contacts,
    onSave: async (updates: AboutContact[]) => {
      await updateAboutContactsOrder(updates)
      // fetchAllData 제거: 로컬 상태가 이미 올바른 순서를 가지고 있음
    },
    debounceMs: 2000, // 2초 후 저장
  })

  // Update reorder hooks when data changes
  useEffect(() => {
    sectionsReorder.setItems(sections)
  }, [sections])

  useEffect(() => {
    activitiesReorder.setItems(activities)
  }, [activities])

  useEffect(() => {
    historyReorder.setItems(history)
  }, [history])

  useEffect(() => {
    contactsReorder.setItems(contacts)
  }, [contacts])

  const hasChanges = useMemo(() => JSON.stringify(formData) !== JSON.stringify(initialFormData), [formData, initialFormData])
  const getItemTitle = (item: DataItem | null) => item ? ('title' in item ? item.title : 'label' in item ? item.label : '') : ''

  const handleAddSection = () => { const d = getEmptyFormData('sections', Math.max(...sections.map(i => i.order), -1)); setEditContext('sections'); setEditingItem(null); setFormData(d); setInitialFormData(d); setViewMode('add') }
  const handleAddActivity = () => { const d = getEmptyFormData('activities', Math.max(...activities.map(i => i.order), -1)); setEditContext('activities'); setEditingItem(null); setFormData(d); setInitialFormData(d); setViewMode('add') }
  const handleAddHistory = () => { const d = getEmptyFormData('history', 0); setEditContext('history'); setEditingItem(null); setFormData(d); setInitialFormData(d); setViewMode('add') }
  const handleAddContact = () => {
    // Check if all types are used
    const usedTypes = contacts.map(c => c.type)
    const availableTypes = ['email', 'github', 'instagram'].filter(t => !usedTypes.includes(t))

    if (availableTypes.length === 0) {
      notify('error', '추가 불가', '모든 연락처 타입이 이미 등록되어 있습니다.')
      return
    }

    const d = getEmptyFormData('contact', Math.max(...contacts.map(i => i.order), -1))
    setEditContext('contact')
    setEditingItem(null)
    setFormData(d)
    setInitialFormData(d)
    setViewMode('add')
  }

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

  const handleEdit = (item: DataItem) => {
    // Infer context from item type
    let context: EditContext
    if ('content' in item) context = 'sections'
    else if ('icon' in item) context = 'activities'
    else if ('year' in item) context = 'history'
    else context = 'contact'

    setEditContext(context)
    const d = itemToFormData(context, item)
    setEditingItem(item)
    setFormData(d)
    setInitialFormData(d)
    setViewMode('edit')
  }
  const handleDeleteClick = (item: DataItem) => { setEditingItem(item); setViewMode('delete') }
  const handleFormChange = (field: string, value: string | number) => setFormData(p => ({ ...p, [field]: value }))
  const handleCancel = () => hasChanges ? setShowUnsavedDialog(true) : setViewMode('list')

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const isEdit = viewMode === 'edit' && editingItem
      const is_active = isEdit ? editingItem!.is_active : true

      if (editContext === 'sections') {
        const d = formData as SectionFormData
        if (isEdit) await updateAboutSection(editingItem!.id, { ...d, is_active })
        else await createAboutSection({ ...d, is_active })
      } else if (editContext === 'activities') {
        const d = formData as AboutActivityFormData
        if (isEdit) await updateAboutActivity(editingItem!.id, { ...d, is_active })
        else await createAboutActivity({ ...d, is_active })
      } else if (editContext === 'history') {
        const d = formData as HistoryFormData
        if (isEdit) await updateAboutHistoryItem(editingItem!.id, { ...d, is_active })
        else await createAboutHistoryItem({ ...d, is_active })
      } else {
        const d = formData as ContactFormData
        if (isEdit) await updateAboutContact(editingItem!.id, { ...d, is_active })
        else await createAboutContact({ ...d, is_active })
      }
      notify('success', isEdit ? '수정 완료' : '생성 완료', `${CONTEXT_LABELS[editContext]}이(가) 성공적으로 ${isEdit ? '수정' : '생성'}되었습니다.`)
      await fetchAllData(); setViewMode('list')
    } catch (e) { console.error(e); notify('error', '오류', `${CONTEXT_LABELS[editContext]} 저장에 실패했습니다.`) }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!editingItem) return
    try {
      setIsSubmitting(true)
      const deleteFns = { sections: deleteAboutSection, activities: deleteAboutActivity, history: deleteAboutHistoryItem, contact: deleteAboutContact }
      await deleteFns[editContext](editingItem.id)
      notify('success', '삭제 완료', `${CONTEXT_LABELS[editContext]}이(가) 삭제되었습니다.`)
      await fetchAllData(); setViewMode('list')
    } catch (e) { console.error(e); notify('error', '오류', '삭제에 실패했습니다.') }
    finally { setIsSubmitting(false) }
  }

  if (loading) return <div className="min-h-screen bg-black flex justify-center items-center"><Loading text="소개 내용을 불러오는 중..." size="lg" /></div>

  const formProps = { onChange: handleFormChange, onSubmit: handleSubmit, onCancel: handleCancel, isSubmitting, hasChanges, mode: viewMode as 'add' | 'edit' }

  return (
    <div className="min-h-screen bg-black">
      {viewMode === 'list' && (
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">소개 관리</h1>
            <p className="text-gray-400">소개 페이지의 각 섹션을 미리보고 관리할 수 있습니다.</p>
          </div>

          <HeroPreview />

          <PreviewSection
            id="sections-section"
            title="섹션"
            description="About 페이지의 주요 콘텐츠 섹션"
            count={sections.length}
            onAdd={handleAddSection}
            addLabel="섹션 추가"
            saveStatus={sectionsReorder.saveStatus}
            isEmpty={sections.length === 0}
            emptyMessage="아직 등록된 섹션이 없습니다"
          >
            {sections.length > 0 && (
              <ReorderableList
                items={sectionsReorder.items}
                onReorder={sectionsReorder.handleReorder}
                saveStatus={sectionsReorder.saveStatus}
                renderItem={(item: AboutSection, handlers?: any) => (
                  <SectionCard
                    section={item}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDeleteClick(item)}
                    {...handlers}
                  />
                )}
              />
            )}
          </PreviewSection>

          <PreviewSection
            id="activities-section"
            title="활동"
            description="클럽 활동 및 이벤트"
            count={activities.length}
            onAdd={handleAddActivity}
            addLabel="활동 추가"
            saveStatus={activitiesReorder.saveStatus}
            isEmpty={activities.length === 0}
            emptyMessage="아직 등록된 활동이 없습니다"
          >
            {activities.length > 0 && (
              <ReorderableList
                items={activitiesReorder.items}
                onReorder={activitiesReorder.handleReorder}
                saveStatus={activitiesReorder.saveStatus}
                renderItem={(item: AboutActivity, handlers?: any) => (
                  <AboutActivityCard
                    activity={item}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDeleteClick(item)}
                    {...handlers}
                  />
                )}
              />
            )}
          </PreviewSection>

          <PreviewSection
            id="history-section"
            title="연혁"
            description="클럽의 주요 역사 및 마일스톤"
            count={history.length}
            onAdd={handleAddHistory}
            addLabel="연혁 추가"
            saveStatus={historyReorder.saveStatus}
            isEmpty={history.length === 0}
            emptyMessage="아직 등록된 연혁이 없습니다"
          >
            {history.length > 0 && (
              <ReorderableHistoryList
                items={historyReorder.items}
                onReorder={historyReorder.handleReorder}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                saveStatus={historyReorder.saveStatus}
              />
            )}
          </PreviewSection>

          <PreviewSection
            id="contacts-section"
            title="연락처"
            description="클럽 연락 정보 및 소셜 미디어"
            count={contacts.filter(c => c.type !== 'phone').length}
            onAdd={handleAddContact}
            addLabel="연락처 추가"
            saveStatus="idle"
            isEmpty={contacts.filter(c => c.type !== 'phone').length === 0}
            emptyMessage="아직 등록된 연락처가 없습니다"
          >
            {contacts.filter(c => c.type !== 'phone').length > 0 && (
              <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                {contacts
                  .filter(c => c.type !== 'phone')
                  .sort((a, b) => {
                    const orderA = CONTACT_TYPE_ORDER[a.type as keyof typeof CONTACT_TYPE_ORDER] ?? 999
                    const orderB = CONTACT_TYPE_ORDER[b.type as keyof typeof CONTACT_TYPE_ORDER] ?? 999
                    return orderA - orderB
                  })
                  .map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={() => handleEdit(contact)}
                      onDelete={() => handleDeleteClick(contact)}
                      showDragHandle={false}
                    />
                  ))}
              </div>
            )}
          </PreviewSection>
        </div>
      )}

      {(viewMode === 'add' || viewMode === 'edit') && (
        <>
          {editContext === 'sections' && <SectionForm formData={formData as SectionFormData} {...formProps} />}
          {editContext === 'activities' && <AboutActivityForm formData={formData as AboutActivityFormData} {...formProps} />}
          {editContext === 'history' && <HistoryForm formData={formData as HistoryFormData} {...formProps} />}
          {editContext === 'contact' && (
            <ContactForm
              formData={formData as ContactFormData}
              existingContacts={contacts}
              editingContactId={editingItem?.id}
              {...formProps}
            />
          )}
        </>
      )}

      {viewMode === 'delete' && <DeleteConfirmView itemType={editContext} itemTitle={getItemTitle(editingItem)} onConfirm={handleDelete} onCancel={() => setViewMode('list')} isDeleting={isSubmitting} />}

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
