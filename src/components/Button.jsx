import React from 'react';

const Button = ({value, callback}) => {
  return(
  <button className={value} onClick={callback}>{value}</button>
  )
}

export default Button;