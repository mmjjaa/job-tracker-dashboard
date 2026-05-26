import { useEffect, useRef, useState } from 'react'
import { useJobStore } from '../../store/jobStore'

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        Map: new (container: HTMLElement, options: object) => KakaoMap
        Marker: new (options: object) => KakaoMarker
        InfoWindow: new (options: object) => KakaoInfoWindow
        LatLng: new (lat: number, lng: number) => object
        services: {
          Geocoder: new () => KakaoGeocoder
          Status: { OK: string }
        }
      }
    }
  }
}

interface KakaoMap {
  setCenter: (latlng: object) => void
}
interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void
  getPosition: () => object
  addListener?: (event: string, callback: () => void) => void
}
interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void
  close: () => void
}
interface KakaoGeocoder {
  addressSearch: (
    address: string,
    callback: (result: Array<{ x: string; y: string }>, status: string) => void
  ) => void
}

export default function MapSection() {
  const jobs = useJobStore((s) => s.jobs)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<KakaoMap | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [noKey, setNoKey] = useState(false)

  const jobsWithAddress = jobs.filter((j) => j.address?.trim())

  useEffect(() => {
    const key = import.meta.env.VITE_KAKAO_MAP_KEY?.trim()
    if (!key) { setNoKey(true); return }

    if (window.kakao?.maps) { setLoaded(true); return }

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => setLoaded(true))
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!loaded || !mapRef.current) return

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 8,
    })
    mapInstanceRef.current = map

    if (jobsWithAddress.length === 0) return

    const geocoder = new window.kakao.maps.services.Geocoder()

    jobsWithAddress.forEach((job) => {
      geocoder.addressSearch(job.address, (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK) return
        const coords = new window.kakao.maps.LatLng(
          parseFloat(result[0].y),
          parseFloat(result[0].x)
        )
        const marker = new window.kakao.maps.Marker({ position: coords })
        marker.setMap(map)

        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding:8px 12px;font-size:13px;min-width:120px">
              <strong style="color:#1f2937">${job.company}</strong>
              <div style="color:#6b7280;margin-top:2px;font-size:12px">${job.position}</div>
            </div>
          `,
        })

        window.kakao.maps.load(() => {
          // @ts-expect-error kakao maps event
          window.kakao.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(map, marker)
          })
        })
      })
    })
  }, [loaded, jobsWithAddress.length])

  if (noKey) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">📍 회사 위치 지도</p>
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-500 font-medium">카카오맵 API 키가 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">.env에 VITE_KAKAO_MAP_KEY를 추가해주세요</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">📍 회사 위치 지도</p>
        <span className="text-xs text-gray-400">
          주소 등록된 공고 {jobsWithAddress.length}건
        </span>
      </div>
      {jobsWithAddress.length === 0 && (
        <p className="text-xs text-gray-400 mb-3">공고 추가 시 회사 주소를 입력하면 지도에 표시됩니다</p>
      )}
      <div ref={mapRef} className="w-full h-64 rounded-lg bg-gray-100" />
    </div>
  )
}
