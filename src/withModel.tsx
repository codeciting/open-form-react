// @ts-ignore
import React from 'react'
import { FunctionComponent, useCallback, useMemo, useState } from 'react'

import { Model, Field, ModelFormUiConfig, Section, validateAllConstraints, ConstraintsErrorPayload } from '@codeciting/open-form'
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
    const [errors, setErrors] = useState(() => coordinator.makeErrorsMap())

    const submit = useCallback(() => {
      if (validateForm(data)) {
        onSubmit(data)
      }
    }, [])

    const reset = useCallback(() => {
      setData(coordinator.normalize(initialData || {}))
    }, [])

    const updateData = useCallback((key, value) => {
      setData(prev => Object.assign({}, prev, { [key]: value }))
    }, [])

    const validateForm = useCallback((data) => {
      const errorsRecords: Record<keyof P, ConstraintsErrorPayload<keyof P>[]> = {} as any
      let flag = false
      for (let field of coordinator.model.fields) {
        let errors = validateAllConstraints(field, data[field.name])
        if (errors.length > 0) {
          errorsRecords[field.name] = errors
          flag = true
        }
      }
      if (flag) {
        setErrors(prev => Object.assign({}, prev, errorsRecords))
      } else {
        setErrors(coordinator.makeErrorsMap())
      }
      return flag
    }, [])

    const validateField = useCallback((field, value) => {
      setErrors(prev => Object.assign({}, prev, { [field.name]: validateAllConstraints(field, value) }))
    }, [])

    return <Wrapper submit={ submit } reset={ reset } submitting={ submitting }>
      { sections.map((section, index) =>
        <Section section={ section } key={ index }>
          { section.rows.map((field) =>
            <Row key={ field.name as string }
                 field={ field }
                 readonly={ submitting ? false : field.readonly }
                 value={ data[field.name] }
                 onChange={ value => updateData(field.name, value) }
                 doValidate={ () => validateField(field, data[field.name]) }
                 error={ errors[field.name] }
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
  doValidate: () => void
  error: ConstraintsErrorPayload<keyof P>[]
}

export type ModelFormProps<P> = {
  onSubmit: ((data: P) => void)
  submitting: boolean
}
