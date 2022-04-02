import React from 'react'

interface IMainProps {
	children: React.ReactNode
}

const Main = (props: IMainProps) => <main className="uk-width-4-5 uk-align-center" >{props.children}</main>

export default Main
