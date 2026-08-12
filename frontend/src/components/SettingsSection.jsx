import { useState } from "react";
const SettingsSection = ({title, items, onAdd, onDeactivate}) => {

    const [inputValue, setInputValue] = useState('')
    const handleAdd = () => {
    if (!inputValue.trim()) return
    onAdd(inputValue.trim())
    setInputValue('')
}
    return(
         <div>
            <h2>{title}</h2>
            <div>
                <input 
                type="text" 
                placeholder={`New ${title.lowerCase()} name`}
                value={inputValue}
                onChange={(e) =>  setInputValue(e.target.value)}
                />
            <button onClick={handleAdd}>
                    Add
            </button>

            <div>
                {
                    items.map((item)=>(
                        <div key={item.id}>
                            <span>{item.name}</span>
                            <button onClick={() => onDeactivate(item.id)}>Deactivate</button>

                        </div>
                    )
                    )
                }
            </div>
            </div>

        </div>
    )
      
    
}

export default SettingsSection