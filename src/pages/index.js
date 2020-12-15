import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import VizRender from "../components/viz/VizRender"
const log = console.log

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <VizRender />
  </Layout>
)

export default IndexPage
