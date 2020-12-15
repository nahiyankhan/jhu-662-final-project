import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

const Header = ({ siteTitle, siteAuthor }) => (
  <header>
    <div>
      <h1>
        <Link
          to="/"
          style={{
            textDecoration: `none`,
          }}
        >
          {siteTitle}
        </Link>
      </h1>
      <p>A React+D3 data visualization project by {siteAuthor}</p>
    </div>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
