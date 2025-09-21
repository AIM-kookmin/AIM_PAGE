import React, { useState } from 'react'
import { Card } from './Card'
import { Text } from './Text'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items: FAQItem[]
  title?: string
  icon?: React.ReactNode
}

export const FAQ: React.FC<FAQProps> = ({
  items,
  title = '자주 묻는 질문',
  icon = '💡'
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }
  
  return (
    <Card variant="default" padding="lg" className="rounded-xl">
      {/* 헤더 */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">{icon}</span>
        </div>
        <Text as="h2" size="3xl" weight="bold" variant="primary">
          {title}
        </Text>
      </div>
      
      {/* FAQ 목록 */}
      <div className="space-y-4">
        {items.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => toggleFaq(index)}
          />
        ))}
      </div>
    </Card>
  )
}

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  isOpen,
  onToggle
}) => {
  return (
    <div className="bg-gray-700/50 backdrop-blur rounded-xl border border-gray-600 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-gray-700/70 transition-colors duration-200 flex items-center justify-between"
      >
        <Text as="h3" size="lg" weight="semibold" variant="primary" className="pr-4">
          {question}
        </Text>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-600/50">
          <Text variant="primary" className="pt-4 leading-relaxed">
            {answer}
          </Text>
        </div>
      )}
    </div>
  )
}

export default FAQ
