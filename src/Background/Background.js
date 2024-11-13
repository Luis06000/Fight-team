import React, { useEffect, useState } from "react";
import { tsParticles } from "https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.1.0/+esm";
import { loadAll } from "https://cdn.jsdelivr.net/npm/@tsparticles/all@3.1.0/+esm";

function Background() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    const loadParticles = async () => {
      await loadAll(tsParticles);

      const options = {
        background: {
          color: {
            value: "#f8ffb2"
          },
        },
        particles: {
          number: {
            value: 15,
            density: {
              enable: true,
              value_area: 639.7441023590567
            }
          },
          color: {
            value: "#fff900"
          },
          shape: {
            type: "circle",
            stroke: {
              width: 1,
              color: "#000"
            },
            polygon: {
              nb_sides: 6
            }
          },
          opacity: {
            value: 0.383846461415434,
            random: false,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 60,
            random: false,
            anim: {
              enable: true,
              speed: 2,
              size_min: 40,
              sync: false
            }
          },
          line_linked: {
            enable: false,
            distance: 200,
            color: "#ffffff",
            opacity: 1,
            width: 2
          },
          move: {
            enable: true,
            speed: 2,
            direction: "bottom-right",
            random: false,
            straight: false,
            out_mode: "bounce",
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: false,
              mode: "grab"
            },
            onclick: {
              enable: false,
              mode: "push"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 400,
              line_linked: {
                opacity: 1
              }
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3
            },
            repulse: {
              distance: 200,
              duration: 0.4
            },
            push: {
              particles_nb: 4
            },
            remove: {
              particles_nb: 2
            }
          }
        },
        retina_detect: true
      };

      await tsParticles.load({ id: "tsparticles", options });
    };

    loadParticles();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [windowDimensions]);

  return <div id="tsparticles" style={{
    zIndex: -1,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#f8ffb2'
  }}/>;
}

export default Background;
