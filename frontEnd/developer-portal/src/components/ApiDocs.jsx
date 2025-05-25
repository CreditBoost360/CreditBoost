import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

const ApiDocs = () => {
  return (
    <div className="api-docs">
      <SwaggerUI url="/api/docs/swagger.yaml" />
    </div>
  )
}

export default ApiDocs

