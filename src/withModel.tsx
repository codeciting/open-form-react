// @ts-ignore
import React from 'react'
import { FunctionComponent, useCallback, useMemo, useState } from 'react'

import { Model, Field, ModelFormUiConfig, Section } from '@codeciting/open-form'
import { useModelCoordinator } from './hooks'

export function withModel<UI, P> (
  model: Model<UI, P>,
  initialData: Partial<P> | null,
  formConfig: ModelFormUiConfig<UI>,
  Wrapper: FunctionComponent<ModelFormWrapperProps>,
  Section: FunctionComponent<ModelFormSectionProps<UI, P>>,
  Row: FunctionComponent<ModelFormRowProps<UI, P>>
): FunctionComponent<ModelFormProps<P>> {
  return function OpenForm ({ onSubmit, submitting }) {
    const coordinator = useModelCoordinator(model)
    const sections = useMemo(() => coordinator.makeForm(formConfig), [coordinator, formConfig])

    const [data, setData] = useState(() => coordinator.normalize(initialData || {}))

    const submit = useCallback(() => {
      onSubmit(data)
    }, [])

    const reset = useCallback(() => {
      setData(coordinator.normalize(initialData || {}))
    }, [])

    const updateData = useCallback((key, value) => {
      setData(prev => Object.assign({}, prev, { [key]: value }))
    }, [])

    const errors = useState(null)

    return <Wrapper submit={ submit } reset={ reset } submitting={ submitting }>
      { sections.map((section, index) =>
        <Section section={ section } key={ index }>
          { section.rows.map((field) =>
            <Row key={ field.name as string }
                 field={ field }
                 readonly={ submitting ? false : field.readonly }
                 value={ data[field.name] }
                 onChange={ value => updateData(field.name, value) }
            />
          ) }
        </Section>
      ) }
    </Wrapper>
  }
}

export type ModelFormWrapperProps = {
  submit: () => void
  reset: () => void
  submitting: boolean
}

export type ModelFormSectionProps<UI, P> = {
  section: Section<UI, P>
}

export type ModelFormRowProps<UI, P> = {
  field: Field<UI, any, keyof P>
  readonly: boolean
  value: any
  onChange: (newValue: any) => void
}

export type ModelFormProps<P> = {
  onSubmit: ((data: P) => void)
  submitting: boolean
}