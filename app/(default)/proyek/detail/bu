<ConditionalComponent
  condition={selectVersi.size}
  component={
    <>
      {/* rekapitulasi */}
      <div className="bg-white rounded-lg p-3 w- text-nowrap">
        <div>Rekapitulasi</div>
        <div className="flex gap-2">
          <div className="basis-">
            <div>Sub Total Modal</div>
            <div>Sub Total Harga</div>
            <div>Maks Diskon</div>
            <div>Diskon</div>
            <div>Harga Setelah Diskon</div>
            <div>Pajak ({selectedRekapitulasiProyek?.pajak}%)</div>
            <div>Harga Setelah Pajak</div>
            <div>Estimasi Provit</div>
          </div>
          <div className="basis- text-right">
            <div>
              <Harga harga={totalModal} />
            </div>
            <div>
              <Harga harga={totalHarga} />
            </div>
            <div>
              ({maksDiskonPersen.toFixed(2)}%){" "}
              <Harga label={``} harga={maksDiskon} />
            </div>
            <div>
              ({diskonPersen.toFixed(2)}%){" "}
              <Harga harga={rekapDiskon} endContent={``} />
            </div>
            <div>
              <Harga harga={hargaDiskon} />
            </div>
            <div>
              <Harga harga={pajak} />
            </div>
            <div>
              <Harga harga={finalHarga} />
            </div>
            <div>
              ({persenProvit.toFixed(2)}%) <Harga harga={provit} />
            </div>
            <ConditionalComponent
              condition={selectedProyek.versi == 0}
              component={
                <Button
                  onPress={handleButtonEdit}
                  color="primary"
                  className="float-right mt-3"
                >
                  Edit
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </>
  }
/>;
