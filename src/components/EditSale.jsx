import AddSale from './AddSale'

function EditSale({ sale, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[95vh] w-full max-w-6xl overflow-y-auto">
        <AddSale
          initialSale={sale}
          isEditing
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>
    </div>
  )
}

export default EditSale