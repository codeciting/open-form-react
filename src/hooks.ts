import { Model, ModelFormCoordinator } from '@codeciting/open-form'
import { useMemo } from 'react'

export function useModelCoordinator<UI, P> (model: Model<UI, P>): ModelFormCoordinator<UI, P> {
  return useMemo(() => model.makeFormCoordinator(), [model])
}
