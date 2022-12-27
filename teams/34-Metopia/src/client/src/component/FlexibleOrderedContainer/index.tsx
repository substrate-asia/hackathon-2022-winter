import React, { ReactElement, useMemo } from 'react'
import { useElementSize } from 'usehooks-ts'
import './index.scss'

const FlexibleOrderedContainer = (props: { elementMinWidth: number, elementMaxWidth: number, gap: number, children, style?, className?}) => {
    const { className } = props
    const [squareRef, { width }] = useElementSize()

    const placeHolders = useMemo(() => {
        let tmp: JSX.Element[] = []
        let maxNum = Math.floor((width + props.gap) / (props.elementMinWidth + props.gap))
        let minNum = Math.floor((width + props.gap) / (props.elementMaxWidth + props.gap))

        let maxRowsNum = Math.ceil(((props.children as Array<ReactElement>) || []).length / minNum)
        let lastRowNum = ((props.children as Array<ReactElement>) || []).length % (maxRowsNum > 1 ? maxNum : minNum)

        while (tmp.length < ((maxRowsNum > 1 ? maxNum : minNum) - lastRowNum)) {
            tmp.push(<div className="placeholder" key={tmp.length} style={{
                minWidth: props.elementMinWidth + 'px',
                maxWidth: props.elementMaxWidth + 'px'
            }} ><div style={{ width: props.elementMaxWidth + 'px', height: '1px' }}></div></div>)
        }
        return tmp
    }, [width, props.elementMinWidth, props.elementMaxWidth])

    const style = useMemo(() => Object.assign({}, { gap: props.gap || 0 }, props.style || {}), [props.gap, props.style])
    return <div className={"flexible-ordered-container " + (className || '')} ref={squareRef}
        style={style}>
        {props.children}
        {placeHolders}
    </div>

}

export default FlexibleOrderedContainer