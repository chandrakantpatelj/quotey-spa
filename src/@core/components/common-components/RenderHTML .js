import React from 'react';
import PropTypes from 'prop-types';

const RenderHTML = ({ html }) => {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

RenderHTML.propTypes = {
    html: PropTypes.string.isRequired,
};

export default RenderHTML;
