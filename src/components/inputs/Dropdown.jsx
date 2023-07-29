import Fuse from 'fuse.js'
import React, { useRef, useState } from 'react'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import { classNames } from '../../helpers/class-names.js'
import { useMount } from '../../hooks/useMount'

export function Dropdown(props) {
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(props.value)
  const [dirty, setDirty] = useState(false)
  const [index, setIndex] = useState(
    props.options.findIndex((o) => o.value === props.value)
  )
  const option = props.options.find(
    (o) => o.value === input || (o.value === props.value && !dirty)
  )

  const fuse = new Fuse(props.options, {
    keys: ['value', 'title', 'description'],
    threshold: 0.4,
  })

  const options =
    dirty && input
      ? fuse.search(input).map((result) => result.item)
      : props.options

  if (!options.length) {
    options.push({
      title: 'No results found',
      value: '',
      disabled: true,
      description: 'Try a different search',
    })
  }

  function handleChange(e) {
    const value = e?.currentTarget?.value
    setDirty(true)
    setInput(value)
    setIndex(
      value ? 0 : props.options.findIndex((o) => o.value === props.value)
    )
    props.onChange(value)
  }

  function handleClick(option) {
    handleChange({ currentTarget: { value: option.value } })
    setDirty(false)
    handleClose()
  }

  function handleClose() {
    setOpen(false)
    setDirty(false)
    setIndex(props.options.findIndex((o) => o.value === props.value))
  }

  function handleOpen() {
    setOpen(true)
    setDirty(false)
    if (inputRef.current) inputRef.current.select()
  }

  function scrollIntoView({ nextIndex, previousIndex }) {
    const index = nextIndex ?? previousIndex
    const ref = document.querySelector(`[data-value="${options[index].value}"]`)
    const containerRef = ref.parentNode
    const isOutOfView =
      ref.offsetTop < containerRef.scrollTop ||
      ref.offsetTop + ref.offsetHeight >
        containerRef.scrollTop + containerRef.offsetHeight

    // Pointer events are disabled during the scroll in order to prevent
    // mouseover events from firing while scrolling which would cause
    // the index to change and the scroll to jump around
    containerRef.style.pointerEvents = 'none'
    ref?.scrollIntoView({ block: 'nearest' })

    if (nextIndex && isOutOfView) ref.parentNode.scrollTop += 4
    if (previousIndex && isOutOfView) ref.parentNode.scrollTop -= 4
    setTimeout(() => (containerRef.style.pointerEvents = 'auto'), 0)
  }

  function handleKeydown(e) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        handleClose()
        e.currentTarget?.blur()
        break
      case 'Enter':
        e.preventDefault()
        e.stopPropagation()
        handleClick(options[index])
        break
      case 'ArrowDown':
        e.preventDefault()
        e.stopPropagation()
        const nextIndex = (index + 1) % options.length
        setIndex(nextIndex)
        scrollIntoView({ nextIndex })
        break
      case 'ArrowUp':
        e.preventDefault()
        e.stopPropagation()
        const previousIndex = (index - 1 + options.length) % options.length
        setIndex(previousIndex)
        scrollIntoView({ previousIndex })
        break
      case 'Tab':
        handleClose()
        break
    }
  }

  function handleMouseOver(e) {
    const value = e?.currentTarget?.dataset?.value
    const index = options.findIndex((o) => o.value === value)
    setIndex(index)
  }

  // TODO(mike): Should not open below if there is more space but input fits anyways
  const rect = inputRef.current?.getBoundingClientRect()
  const position = {
    top: rect?.top + window.scrollY,
    left: rect?.left + window.scrollX,
  }

  const viewportHeight = window.innerHeight
  const spaceAbove = position.top
  const spaceBelow = viewportHeight - (position.top + rect?.height)
  const popupPosition = spaceBelow > spaceAbove ? 'below' : 'above'

  return (
    <div
      className="relative font-semibold text-xs"
      ref={useOutsideClick(handleClose)}
      onClick={handleOpen}
    >
      <label className=" bg-white absolute text-xxs -top-2 left-1.5 px-1 text-neutral-500">
        {props.label}
      </label>

      <Options open={open} position={popupPosition}>
        {options.map((option, i) => (
          <Option
            selected={option.value === props.value}
            focused={option.value === options[index]?.value}
            option={option}
            key={`option-${option.value}:${i}`}
            onClick={handleClick}
            onMouseOver={handleMouseOver}
          />
        ))}
      </Options>

      <input
        ref={inputRef}
        type="text"
        className="border border-neutral-200 h-9 px-3 py-1 outline-none rounded-md w-full text-neutral-900"
        placeholder={props.placeholder}
        value={option?.title || input}
        onChange={handleChange}
        disabled={props.disabled}
        onKeyDown={handleKeydown}
        onFocus={handleOpen}
        onClick={handleOpen}
      />
    </div>
  )
}

function Options(props) {
  props.position ||= 'below'

  if (!props.open) return null

  function handleRef(ref) {
    if (!ref) return

    const boundings = ref.getBoundingClientRect()
    const maxHeight =
      props.position === 'below'
        ? window.innerHeight - boundings?.top - 10
        : boundings?.top - 10
    ref.style.maxHeight = `${maxHeight}px`
  }

  const positionStyle = props.position === 'below' ? 'top-10' : 'bottom-11'

  return (
    <div
      ref={handleRef}
      className={`absolute ${positionStyle} left-0 w-full z-30 rounded border bg-white shadow-sm overflow-scroll`}
      onMouseEnter={props.onMouseEnter}
      style={{ overscrollBehavior: 'none' }}
    >
      {props.children}
    </div>
  )
}

function Option(props) {
  const ref = useRef(null)

  useMount(function () {
    if (props.selected)
      ref.current.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  })

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!props.option.disabled) props.onClick(props.option)
  }

  return (
    <div
      ref={ref}
      className={classNames({
        'flex flex-col px-2 py-1 m-1 rounded': true,
        'hover:bg-neutral-100': !props.selected,
        'bg-blue-50 text-blue-900': props.selected,
        'bg-neutral-200 bg-opacity-80': props.focused && !props.selected,
        'bg-blue-400 bg-opacity-70': props.focused && props.selected,
      })}
      onClick={handleClick}
      data-value={props.option.value}
      onMouseOver={props.onMouseOver}
    >
      {props.option.title}
      <span className="text-xxs opacity-60">{props.option.description}</span>
    </div>
  )
}
