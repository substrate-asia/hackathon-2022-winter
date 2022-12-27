import './index.scss'

import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Picker, Data } from 'emoji-mart'
// import data from '@emoji-mart/data'
import data from '../../../../config/emojiData'
import React, { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'usehooks-ts'
import { cdnPrefix } from '../../../../config/urls'
import { uploadImg } from '../../../../utils/imageUtils'
import { useAlertModal } from '../../../modals/AlertModal'
import { useLoadingModal } from '../../../modals/LoadingModal'
import Link from '@tiptap/extension-link'

Link.configure({
    autolink: false,
})

function EmojiPicker(props) {
    const ref = useRef()

    useEffect(() => {
        new Picker({ ...props, data, ref })
    }, [props])

    return <div ref={ref} />
}

const EmojiModal = (props: { editor, isShow, onHide }) => {

    const { editor, isShow, onHide } = props

    return <div className={"emoji-wrapper" + (!isShow ? ' hidden' : '')}  >
        <EmojiPicker onEmojiSelect={(e) => {
            editor.chain().focus().insertContent(e.native).run()
            onHide()
        }} />
        <div className="mask" onClick={onHide}></div></div>
}


const Emoji = (props) => {
    const { disabled, editor } = props
    const [isShow, setIsShow] = useState(false)
    const showEmojiModal = () => {
        setIsShow(true)
    }
    return (
        <div className="EmojiButton" >
            <div
                onClick={showEmojiModal}
                className={'button emoji '}
            >
                <img src="https://oss.metopia.xyz/imgs/emoji.svg" alt="XD" />
            </div>
            {/* <EmojiButton editor={editor}
                disabled={disabled} showEmojiModal={showEmojiModal} format="emoji_emotions" icon="emoji_emotions" /> */}
            <EmojiModal isShow={isShow} editor={editor} onHide={() => {
                setIsShow(false)
            }} />
        </div >
    )
}

const EmojiButton = ({ showEmojiModal, format, icon, disabled, editor }) => {
    return (
        <div
            onClick={showEmojiModal}
            className={'button emoji '}
        >

        </div>
        // <Button
        //     onMouseDown={e => e.preventDefault()}
        //     onClick={event => {
        //         if (disabled)
        //             return
        //         event.preventDefault()
        //         ReactEditor.focus(editor)
        //         showEmojiModal()
        //     }}
        // >
        //     <Icon>{icon}</Icon>
        // </Button>
    )
}

const MenuBar = ({ editor }) => {
    const { display: alert } = useAlertModal()
    const { display: setLoading, hide: hideLoading } = useLoadingModal()
    const imageSelector = useRef(null)
    if (!editor) {
        return null
    }

    return (
        <div className='menubar'>
            <div
                onClick={() => {
                    if (editor.can().chain().focus().toggleBold().run()) {
                        editor.chain().focus().toggleBold().run()
                    }
                }}
                className={'button bold ' + (editor.isActive('bold') ? 'is-active' : '')}
            >
                B
            </div>
            <div
                onClick={() => {
                    if (editor.can()
                        .chain()
                        .focus()
                        .toggleItalic()
                        .run()) {
                        editor.chain().focus().toggleItalic().run()
                    }
                }}
                className={'button italic ' + (editor.isActive('italic') ? 'is-active' : '')}
            >
                <span>I</span>
            </div>
            <div
                onClick={() => {
                    if (editor.can().chain().focus().toggleStrike().run()) {
                        editor.chain().focus().toggleStrike().run()
                    }
                }}
                className={'button strike ' + (editor.isActive('strike') ? 'is-active' : '')}
            >
                S
            </div>

            <div
                onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }}
                className={'button heading ' + (editor.isActive('heading', { level: 1 }) ? 'is-active' : '')}
            >
                h<span className='index'>1</span>
            </div><div
                onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }}
                className={'button heading ' + (editor.isActive('heading', { level: 2 }) ? 'is-active' : '')}
            >
                h<span className='index'>2</span>
            </div><div
                onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }}
                className={'button heading ' + (editor.isActive('heading', { level: 3 }) ? 'is-active' : '')}
            >
                h<span className='index'>3</span>
            </div>
            <div
                onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 4 }).run()
                }}
                className={'button heading ' + (editor.isActive('heading', { level: 4 }) ? 'is-active' : '')}
            >
                h<span className='index'>4</span>
            </div>

            <div
                onClick={() => {
                    const previousUrl = editor.getAttributes('link').href
                    let url = window.prompt('URL', previousUrl)
                    if (url === null) {
                        return
                    }
                    if (url === '') {
                        editor.chain().focus().extendMarkRange('link').unsetLink()
                            .run()
                        return
                    }
                    if (!url.startsWith("http")) {
                        url = "https://" + url
                    }
                    editor.chain().focus().extendMarkRange('link').setLink({ href: url })
                        .run()
                }}
                className={'button link ' + (editor.isActive('link') ? 'is-active' : '')}
            >
                <img src="https://oss.metopia.xyz/imgs/link.svg" />
            </div>

            <Emoji editor={editor} />
            <div onClick={() => {
                imageSelector.current.click()
            }}
                className={'button image ' + (editor.isActive('heading', { level: 4 }) ? 'is-active' : '')}
            >
                <img src="https://oss.metopia.xyz/imgs/image.svg" />
                <input type='file' className="Hidden" ref={imageSelector}
                    onChange={async (e) => {
                        if (!e.target.files[0])
                            return
                        setLoading("Uploading the image...")
                        // let result = await 
                        uploadImg(e.target.files[0]).then(result => {
                            if (!result?.content?.length) {
                                alert("Image upload failed. Please check your network.")
                                imageSelector.current.value = ""
                                return
                            }
                            editor.chain().focus().setImage({ src: cdnPrefix + result.content }).run()
                            hideLoading()
                        }).catch(e => {
                            hideLoading()
                            alert("Image upload failed")
                        })

                    }}
                    accept='image/*' />
            </div>

            <div
                onClick={() => {
                    editor.chain().focus().toggleOrderedList().run()
                }}
                className={'button ordered-list ' + (editor.isActive('orderedList') ? 'is-active' : '')}
            >
                <img src="https://oss.metopia.xyz/imgs/ordered list.svg" />
            </div>
            <div
                onClick={() => {
                    editor.chain().focus().toggleBulletList().run()
                }}
                className={'button unordered-list ' + (editor.isActive('bulletList') ? 'is-active' : '')}
            >
                <img src="https://oss.metopia.xyz/imgs/unordered list.svg" />
            </div>
        </div>
    )
}

const TipTap = (props: { onChange, initialValue?, className?}) => {
    const { initialValue, className, onChange } = props
    const [focused, setFocused] = useState(false)
    const [content, setContent] = useState('')

    const editor = useEditor({
        extensions: [
            StarterKit,
            Document,
            Paragraph,
            Text,
            Image,
            Dropcursor,
            Link
        ],
        content: initialValue || '',
    })

    useEffect(() => {
        if (editor) {
            editor.on('update', e => {
                setContent(e.editor.getHTML())
            })
            editor.on('focus', e => {
                setFocused(true)
            })
            editor.on('blur', e => {
                setFocused(false)
            })
            return () => {
                editor.off('update')
                editor.off('focus')
                editor.off('blur')
            }
        }

    }, [editor])

    const debouncedContent = useDebounce(content, 300)
    const [lastContent, setLastContent] = useState('')

    useEffect(() => {
        if (debouncedContent != lastContent) {
            onChange(debouncedContent)
            setLastContent(debouncedContent)
        }
    }, [debouncedContent, onChange, lastContent])


    return (
        <div className={"RichText tip-tap " + (focused ? ' focused ' : '') + className}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />

        </div>
    )
}

export default TipTap